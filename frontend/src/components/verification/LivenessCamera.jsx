import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

// Step messages shown to user
const STEP_MESSAGES = [
  'Adjust your head to the camera…',
  'Hold still — scanning…',
  'Almost there…',
  '✓ Face confirmed',
];

// Detect if there is a face-like region in the frame
// Uses skin tone pixel sampling — works in any lighting
function detectFacePresence(video) {
  if (!video || video.readyState < 2) return false;
  const canvas = document.createElement('canvas');
  canvas.width  = 80;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, 80, 80);
  const { data } = ctx.getImageData(0, 0, 80, 80);
  let skinPixels = 0;
  let nonBlackPixels = 0;
  const total = 80 * 80;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];

    // Count non-black pixels (anything with meaningful content)
    if (r + g + b > 60) nonBlackPixels++;

    // Broad skin tone — covers ALL ethnicities including very dark skin
    // Method: look for organic warm tones, not just light skin
    const isSkin = (
      // Light to medium skin
      (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r-g) > 15) ||
      // Dark to very dark skin — lower thresholds, still warm
      (r > 40 && g > 20 && b > 10 && r > b && r > g * 0.8 && r + g + b > 80) ||
      // Brown tones
      (r > 60 && g > 30 && b > 15 && r - b > 10 && g - b > 5) ||
      // High brightness warm (overexposed light skin)
      (r > 200 && g > 150 && b > 100 && r > b)
    );
    if (isSkin) skinPixels++;
  }

  // Two signals: skin pixels OR just significant non-black content in center
  const skinRatio = skinPixels / total;
  const contentRatio = nonBlackPixels / total;

  // Sample center region specifically (where face should be)
  const centerData = ctx.getImageData(25, 15, 30, 50);
  let centerSkin = 0;
  for (let i = 0; i < centerData.data.length; i += 4) {
    const r = centerData.data[i], g = centerData.data[i+1], b = centerData.data[i+2];
    if (r > 30 && g > 15 && b > 10 && r > b && r + g + b > 60) centerSkin++;
  }
  const centerRatio = centerSkin / (centerData.data.length / 4);

  // Very permissive - any meaningful content in center = face present
  return skinRatio > 0.01 || centerRatio > 0.08 || contentRatio > 0.3;
}

export default function LivenessCamera({ currentStep, onStepComplete }) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const frameRef   = useRef(null);
  const stepRef    = useRef(currentStep);
  stepRef.current  = currentStep;

  const [camState,  setCamState]  = useState('requesting'); // requesting | active | denied | error
  const [faceFound, setFaceFound] = useState(false);
  const [message,   setMessage]   = useState('Starting camera…');

  const done = currentStep >= 3;

  // ── Start webcam ────────────────────────────────────────────────────────────
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
      if (err.name === 'NotAllowedError') setCamState('denied');
      else setCamState('error');
    }
  }, []);

  // ── Stop webcam ─────────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  // ── Face detection loop ─────────────────────────────────────────────────────
  useEffect(() => {
    if (camState !== 'active' || done) return;

    let faceHeldFor = 0;
    let noFaceFor   = 0;
    let lastTime    = 0;

    let faceDetected = false;

    const loop = (ts) => {
      if (done || stepRef.current >= 3) return;

      const elapsed = ts - lastTime;
      if (elapsed > 300) {
        lastTime = ts;
        const hasFace = detectFacePresence(videoRef.current);
        setFaceFound(hasFace);
        faceDetected = hasFace;

        if (!hasFace) {
          setMessage('Adjust your head to the camera…');
        } else {
          const step = stepRef.current;
          if (step === 0) setMessage('Hold still — scanning…');
          else if (step === 1) setMessage('Blink once slowly…');
          else if (step === 2) setMessage('Almost there…');
        }
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    // Step timer — advances every 2200ms BUT only if face is present
    const stepTimer = setInterval(() => {
      if (stepRef.current >= 3) { clearInterval(stepTimer); return; }
      if (faceDetected) {
        const next = stepRef.current + 1;
        onStepComplete(next);
        if (next >= 3) {
          clearInterval(stepTimer);
          stopCamera();
        }
      }
    }, 2200);

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      clearInterval(stepTimer);
    };


  }, [camState, done, onStepComplete, stopCamera]);

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!done) startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (done) {
      stopCamera();
      setMessage('✓ Face confirmed');
    }
  }, [done, stopCamera]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-square bg-[#0A0A0A] rounded-2xl overflow-hidden">

        {/* Live video feed */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 scale-x-[-1] ${
            camState === 'active' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Dark overlay — subtle so face is visible */}
        {camState === 'active' && !done && (
          <div className="absolute inset-0 bg-black/20" />
        )}

        {/* Camera requesting / denied / error state */}
        {camState !== 'active' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            {camState === 'requesting' && (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                  <Camera className="w-8 h-8 text-[#E8501A]" />
                </motion.div>
                <p className="text-white/70 text-xs text-center">Requesting camera access…</p>
              </>
            )}
            {camState === 'denied' && (
              <>
                <CameraOff className="w-8 h-8 text-red-400" />
                <p className="text-white/70 text-xs text-center">Camera access denied.<br />Please allow camera in browser settings.</p>
                <button onClick={startCamera} className="text-[#E8501A] text-xs underline mt-1">Try again</button>
              </>
            )}
            {camState === 'error' && (
              <>
                <AlertCircle className="w-8 h-8 text-amber-400" />
                <p className="text-white/70 text-xs text-center">Camera unavailable.<br />Check your device.</p>
                <button onClick={startCamera} className="text-[#E8501A] text-xs underline mt-1">Retry</button>
              </>
            )}
          </div>
        )}

        {/* Face oval guide */}
        {(camState === 'active' || done) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={faceFound || done ? { scale: [1, 1.02, 1] } : { scale: 1 }}
              transition={{ duration: 1.2, repeat: faceFound && !done ? Infinity : 0 }}
              className="w-36 h-44 rounded-full border-2 transition-colors duration-500"
              style={{
                borderColor: done ? '#16A34A' : faceFound ? '#E8501A' : 'rgba(255,255,255,0.25)',
                boxShadow:   done
                  ? '0 0 20px rgba(22,163,74,0.4)'
                  : faceFound
                  ? '0 0 16px rgba(232,80,26,0.35)'
                  : 'none',
              }}
            />
          </div>
        )}

        {/* Scanning ring — only when face detected */}
        {camState === 'active' && faceFound && !done && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              className="w-52 h-52 rounded-full"
              style={{
                border: '2px solid transparent',
                borderTopColor: '#E8501A',
                borderRightColor: 'rgba(232,80,26,0.25)',
              }}
            />
          </div>
        )}

        {/* Corner brackets — guide markers */}
        {camState === 'active' && (
          <>
            {[['top-6 left-6', 'border-t-2 border-l-2'], ['top-6 right-6', 'border-t-2 border-r-2'],
              ['bottom-6 left-6', 'border-b-2 border-l-2'], ['bottom-6 right-6', 'border-b-2 border-r-2']].map(([pos, border], i) => (
              <div key={i} className={`absolute ${pos} w-5 h-5 ${border} transition-colors duration-500`}
                style={{ borderColor: done ? '#16A34A' : faceFound ? '#E8501A' : 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
            ))}
          </>
        )}

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <motion.div
            className="h-full"
            style={{ background: done ? '#16A34A' : '#E8501A' }}
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Status message */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <p className={`text-xs font-medium ${done ? 'text-[#4ADE80]' : faceFound ? 'text-[#FFA07A]' : 'text-white/80'}`}>
                {message}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step counter */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/60 text-white text-[10px] font-mono px-2 py-1 rounded-full">
            {Math.min(currentStep + 1, 3)}/3
          </span>
        </div>

        {/* Face indicator dot */}
        {camState === 'active' && !done && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full transition-colors ${faceFound ? 'bg-[#E8501A]' : 'bg-white/30'}`} />
            <span className="text-[10px] text-white/50">{faceFound ? 'Face detected' : 'No face'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
