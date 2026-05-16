import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// ─── face-api.js loaded from CDN ─────────────────────────────────────────────
// Models served from jsdelivr — loads once, cached by browser
const MODELS_URL = '/models';

// NIN that requires real face matching (your account)
const REAL_MATCH_NIN = '93146458248';

// ─── Load face-api models ─────────────────────────────────────────────────────
let faceApiReady = false;
let faceApiLoading = false;

async function loadFaceApi() {
  if (faceApiReady) return true;
  if (faceApiLoading) {
    await new Promise(r => { const t = setInterval(() => { if (faceApiReady) { clearInterval(t); r(); } }, 100); });
    return true;
  }
  faceApiLoading = true;
  try {
    // Import face-api from npm package (bundled by Vite — no CDN needed)
    const faceapi = await import('@vladmandic/face-api');
    window.faceapi = faceapi;
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
    ]);
    faceApiReady = true;
    return true;
  } catch (e) {
    faceApiLoading = false;
    console.warn('face-api models failed to load — using pixel detection fallback:', e.message);
    return false;
  }
}

// ─── Compute descriptor from an image element ─────────────────────────────────
async function getDescriptor(imgEl) {
  const faceapi = window.faceapi;
  const det = await faceapi
    .detectSingleFace(imgEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 }))
    .withFaceLandmarks(true)
    .withFaceDescriptor();
  return det?.descriptor || null;
}

// ─── Load reference photo + compute its descriptor ───────────────────────────
let refDescriptors = {}; // { nin: Float32Array }

async function loadRefDescriptor(nin) {
  if (refDescriptors[nin]) return refDescriptors[nin];
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload  = () => resolve(el);
      el.onerror = reject;
      el.src = `/faces/${nin}.jpg?v=1`;
    });
    const desc = await getDescriptor(img);
    if (desc) refDescriptors[nin] = desc;
    return desc;
  } catch (e) {
    console.error('ref photo load error:', e);
    return null;
  }
}

// ─── Pixel-based fallback face detection (for non-real-match users) ──────────
function pixelFaceDetect(video) {
  if (!video || video.readyState < 2) return false;
  const c = document.createElement('canvas');
  c.width = 80; c.height = 80;
  const ctx = c.getContext('2d');
  ctx.drawImage(video, 0, 0, 80, 80);
  const { data } = ctx.getImageData(0, 0, 80, 80);
  let skin = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    if (
      (r > 40 && g > 20 && b > 10 && r > b && r + g + b > 80) ||
      (r > 60 && g > 30 && b > 15 && r - b > 10) ||
      (r > 200 && g > 150 && b > 100 && r > b)
    ) skin++;
  }
  const center = ctx.getImageData(20, 15, 40, 50);
  let cs = 0;
  for (let i = 0; i < center.data.length; i += 4) {
    const r = center.data[i], g = center.data[i+1], b = center.data[i+2];
    if (r > 30 && g > 15 && r > b && r + g + b > 60) cs++;
  }
  return skin / 6400 > 0.01 || cs / (center.data.length / 4) > 0.08;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LivenessCamera({ currentStep, onStepComplete, employeeNin }) {
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const frameRef    = useRef(null);
  const stepRef     = useRef(currentStep);
  stepRef.current   = currentStep;
  const refDescRef  = useRef(null);

  const isRealUser  = employeeNin === REAL_MATCH_NIN;

  const [camState,    setCamState]    = useState('requesting');
  const [modelState,  setModelState]  = useState(isRealUser ? 'loading' : 'ready');
  // loading | ready | failed
  const [faceFound,   setFaceFound]   = useState(false);
  const [matchScore,  setMatchScore]  = useState(null); // 0-100, only for real user
  const [matchFailed, setMatchFailed] = useState(false);
  const [message,     setMessage]     = useState('Starting camera…');

  const done = currentStep >= 3;

  // ── Load face-api + reference descriptor for real user ─────────────────────
  useEffect(() => {
    if (!isRealUser) return;
    (async () => {
      setModelState('loading');
      const ok = await loadFaceApi();
      if (!ok) { setModelState('failed'); return; }
      const desc = await loadRefDescriptor(REAL_MATCH_NIN);
      if (desc) { refDescRef.current = desc; setModelState('ready'); }
      else { setModelState('failed'); }
    })();
  }, [isRealUser]);

  // ── Camera ──────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCamState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamState('active');
    } catch (err) {
      setCamState(err.name === 'NotAllowedError' ? 'denied' : 'error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  // ── Detection loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (camState !== 'active' || done || modelState === 'loading') return;

    let faceDetected = false;
    let lastTime     = 0;
    let stepLocked   = false;

    const loop = async (ts) => {
      if (done || stepRef.current >= 3) return;

      const elapsed = ts - lastTime;
      if (elapsed > 350) {
        lastTime = ts;

        if (isRealUser && refDescRef.current && window.faceapi) {
          // ── Real user: face-api detection + matching ──────────────────────
          try {
            const faceapi = window.faceapi;
            const det = await faceapi
              .detectSingleFace(videoRef.current,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }))
              .withFaceLandmarks(true)
              .withFaceDescriptor();

            if (det) {
              const dist  = faceapi.euclideanDistance(det.descriptor, refDescRef.current);
              const score = Math.max(0, Math.round((1 - dist) * 100));
              setMatchScore(score);
              const matched = dist < 0.55; // threshold — tuned for your photos
              setFaceFound(matched);
              faceDetected = matched;

              if (matched) {
                const step = stepRef.current;
                if (step === 0) setMessage('Face matched ✓ — Hold still…');
                else if (step === 1) setMessage(`Match score: ${score}% — Almost there…`);
                else if (step === 2) setMessage('Identity confirmed — processing…');
                setMatchFailed(false);
              } else if (det) {
                setMessage(dist < 0.7
                  ? `Almost matching (${score}%) — adjust your position`
                  : 'Face not recognised — please try again');
                setMatchFailed(dist > 0.8);
              }
            } else {
              setFaceFound(false);
              faceDetected = false;
              setMatchScore(null);
              setMessage('Adjust your face to the camera…');
              setMatchFailed(false);
            }
          } catch (_) {
            // face-api error — fall back to pixel detection
            const hasFace = pixelFaceDetect(videoRef.current);
            setFaceFound(hasFace); faceDetected = hasFace;
            setMessage(hasFace ? 'Hold still — scanning…' : 'Adjust your head to the camera…');
          }
        } else {
          // ── Other employees: pixel detection only ─────────────────────────
          const hasFace = pixelFaceDetect(videoRef.current);
          setFaceFound(hasFace); faceDetected = hasFace;
          const step = stepRef.current;
          setMessage(!hasFace ? 'Adjust your head to the camera…'
            : step === 0 ? 'Hold still — scanning…'
            : step === 1 ? 'Blink once slowly…'
            : 'Almost there…');
        }
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    // Step timer — 2200ms, only advances when face confirmed
    const stepTimer = setInterval(() => {
      if (stepRef.current >= 3 || stepLocked) return;
      if (faceDetected) {
        stepLocked = true;
        const next = stepRef.current + 1;
        onStepComplete(next);
        if (next >= 3) { clearInterval(stepTimer); stopCamera(); }
        setTimeout(() => { stepLocked = false; }, 400);
      }
    }, 2200);

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameRef.current);
      clearInterval(stepTimer);
    };
  }, [camState, done, modelState, isRealUser, onStepComplete, stopCamera]);

  useEffect(() => { if (!done) startCamera(); return stopCamera; }, []);
  useEffect(() => { if (done) { stopCamera(); setMessage('✓ Identity confirmed'); } }, [done, stopCamera]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Model loading banner for real user */}
      {isRealUser && modelState === 'loading' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 bg-[#1A1A1A] border border-[#E8501A]/30 rounded-xl px-3 py-2">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-3 h-3 rounded-full border-2 border-[#E8501A] border-t-transparent shrink-0" />
          <p className="text-[11px] text-white/60">Loading face recognition model…</p>
        </motion.div>
      )}
      {isRealUser && modelState === 'failed' && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
          <AlertCircle size={12} className="text-yellow-600 shrink-0" />
          <p className="text-[11px] text-yellow-700">Face matching unavailable — using basic detection</p>
        </div>
      )}

      <div className="relative w-full aspect-square bg-[#0A0A0A] rounded-2xl overflow-hidden">

        {/* Live video */}
        <video ref={videoRef} autoPlay muted playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 scale-x-[-1] ${
            camState === 'active' ? 'opacity-100' : 'opacity-0'
          }`} />

        {/* Overlay */}
        {camState === 'active' && !done && <div className="absolute inset-0 bg-black/15" />}

        {/* Camera states */}
        {camState !== 'active' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            {camState === 'requesting' && (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                <Camera className="w-8 h-8 text-[#E8501A]" />
              </motion.div><p className="text-white/70 text-xs text-center">Requesting camera access…</p></>
            )}
            {camState === 'denied' && (
              <><CameraOff className="w-8 h-8 text-red-400" />
              <p className="text-white/70 text-xs text-center">Camera access denied.<br/>Allow camera in browser settings.</p>
              <button onClick={startCamera} className="text-[#E8501A] text-xs underline">Try again</button></>
            )}
            {camState === 'error' && (
              <><AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-white/70 text-xs text-center">Camera unavailable.</p>
              <button onClick={startCamera} className="text-[#E8501A] text-xs underline">Retry</button></>
            )}
          </div>
        )}

        {/* Face oval */}
        {(camState === 'active' || done) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={faceFound || done ? { scale: [1, 1.02, 1] } : { scale: 1 }}
              transition={{ duration: 1.2, repeat: faceFound && !done ? Infinity : 0 }}
              className="w-36 h-44 rounded-full border-2 transition-colors duration-500"
              style={{
                borderColor: done ? '#16A34A' : matchFailed ? '#DC2626' : faceFound ? '#E8501A' : 'rgba(255,255,255,0.25)',
                boxShadow: done ? '0 0 24px rgba(22,163,74,0.5)'
                  : matchFailed ? '0 0 16px rgba(220,38,38,0.4)'
                  : faceFound ? '0 0 16px rgba(232,80,26,0.4)' : 'none',
              }}
            />
          </div>
        )}

        {/* Scanning ring */}
        {camState === 'active' && faceFound && !done && !matchFailed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              className="w-52 h-52 rounded-full"
              style={{ border: '2px solid transparent', borderTopColor: '#E8501A', borderRightColor: 'rgba(232,80,26,0.2)' }} />
          </div>
        )}

        {/* Corner brackets */}
        {camState === 'active' && (
          <>{[['top-6 left-6','border-t-2 border-l-2'],['top-6 right-6','border-t-2 border-r-2'],
             ['bottom-6 left-6','border-b-2 border-l-2'],['bottom-6 right-6','border-b-2 border-r-2']
          ].map(([pos, border], i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5 ${border} transition-colors duration-500`}
              style={{ borderColor: done ? '#16A34A' : faceFound ? '#E8501A' : 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
          ))}</>
        )}

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <motion.div className="h-full" style={{ background: done ? '#16A34A' : '#E8501A' }}
            initial={{ width: '0%' }} animate={{ width: `${(currentStep / 3) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        {/* Match score badge — real user only */}
        {isRealUser && matchScore !== null && !done && (
          <div className="absolute top-10 right-3">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                matchScore >= 50 ? 'bg-[#16A34A] text-white' : 'bg-[#DC2626] text-white'
              }`}>
              {matchScore}% match
            </motion.div>
          </div>
        )}

        {/* Status message */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={message} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-4 }} transition={{ duration: 0.2 }}
              className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className={`text-xs font-medium ${
                done ? 'text-[#4ADE80]'
                : matchFailed ? 'text-red-400'
                : faceFound ? 'text-[#FFA07A]'
                : 'text-white/80'
              }`}>{message}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step counter */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/60 text-white text-[10px] font-mono px-2 py-1 rounded-full">
            {Math.min(currentStep + 1, 3)}/3
          </span>
        </div>

        {/* Face/match indicator */}
        {camState === 'active' && !done && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full transition-colors ${
              faceFound ? 'bg-[#16A34A]' : matchFailed ? 'bg-red-500' : 'bg-white/30'
            }`} />
            <span className="text-[10px] text-white/50">
              {isRealUser
                ? faceFound ? 'Identity matched' : matchFailed ? 'No match' : 'Scanning…'
                : faceFound ? 'Face detected' : 'No face'}
            </span>
          </div>
        )}

        {/* Done checkmark */}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <CheckCircle className="w-16 h-16 text-[#16A34A] drop-shadow-lg" />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
