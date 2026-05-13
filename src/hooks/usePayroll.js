// usePayroll - drives the full payroll verification lifecycle.
// All AI scoring and Squad API calls go through the Python backend.
// Frontend state is derived entirely from backend responses.

import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPLOYEES } from '../data/employees.js';
import { scanPayroll, createEscrow } from '../utils/aiService.js';

const CYCLE_ID = 'PYC-2025-05';

export function usePayroll() {
  const [phase,      setPhase]     = useState('idle');        // idle | uploading | scanning | results | locking | locked
  const [progress,   setProgress]  = useState(0);             // 0-100 upload progress
  const [analyzed,   setAnalyzed]  = useState(0);             // records processed so far
  const [scanResult, setScanResult] = useState(null);         // full response from /analyze
  const [escrow,     setEscrow]    = useState(null);          // response from /squad/create-escrow
  const [squadStep,  setSquadStep] = useState(0);             // 0-3 Squad API visual step
  const [error,      setError]     = useState(null);

  const timers = useRef([]);
  const total = EMPLOYEES.length;

  const clearTimers = useCallback(() => {
    timers.current.forEach(t => { clearInterval(t); clearTimeout(t); });
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setProgress(0);
    setAnalyzed(0);
    setScanResult(null);
    setEscrow(null);
    setSquadStep(0);
    setError(null);
  }, [clearTimers]);

  const startScan = useCallback(() => {
    clearTimers();
    setError(null);
    setPhase('uploading');
    setProgress(0);
    setAnalyzed(0);
  }, [clearTimers]);

  // Upload animation
  useEffect(() => {
    if (phase !== 'uploading') return;
    const tid = setInterval(() => {
      setProgress(p => {
        const next = p + 7 + Math.random() * 10;
        if (next >= 100) {
          clearInterval(tid);
          setTimeout(() => setPhase('scanning'), 200);
          return 100;
        }
        return next;
      });
    }, 90);
    timers.current.push(tid);
    return () => clearInterval(tid);
  }, [phase]);

  // Scanning: animate counter + fire real backend call
  useEffect(() => {
    if (phase !== 'scanning') return;

    // Payload for the AI backend - full employee dataset
    const payload = EMPLOYEES.map(e => ({
      id:                 e.id,
      salaryAmount:       e.salaryAmount,
      enrollmentBatchId:  e.enrollmentBatchId,
      enrollmentDate:     e.enrollmentDate,
      lastAttendance:     e.lastAttendance,
      ipAtEnrollment:     e.ipAtEnrollment,
      deviceFingerprint:  e.deviceFingerprint,
      department:         e.department,
    }));

    // Fire AI scan - runs in parallel with the animation
    scanPayroll(payload)
      .then(result => setScanResult(result))
      .catch(err => {
        console.error('AI scan error:', err);
        setError('AI service unavailable. Check that python main.py is running on port 8000.');
      });

    // Animate the counter
    const tid = setInterval(() => {
      setAnalyzed(a => {
        const next = a + 3 + Math.floor(Math.random() * 6);
        if (next >= total) {
          clearInterval(tid);
          setTimeout(() => setPhase('results'), 400);
          return total;
        }
        return next;
      });
    }, 55);
    timers.current.push(tid);
    return () => clearInterval(tid);
  }, [phase, total]);

  // Squad escrow lock
  const lockEscrow = useCallback(async () => {
    setPhase('locking');
    setSquadStep(0);
    setError(null);

    // Step the visual indicator
    [900, 1800, 2700].forEach((ms, i) => {
      const t = setTimeout(() => setSquadStep(i + 1), ms);
      timers.current.push(t);
    });

    try {
      const verifiedEmployees = scanResult
        ? scanResult.results.filter(r => r.status === 'verified')
        : EMPLOYEES.filter(e => e.status === 'verified');

      const totalAmount = verifiedEmployees.reduce((sum, r) => {
        const emp = EMPLOYEES.find(e => e.id === r.id);
        return sum + (emp?.salaryAmount || 0);
      }, 0);

      const resp = await createEscrow(CYCLE_ID, totalAmount, verifiedEmployees.length);

      const t = setTimeout(() => {
        setEscrow(resp);
        setPhase('locked');
      }, 3400);
      timers.current.push(t);
    } catch (err) {
      console.error('Escrow error:', err);
      setError('Squad escrow failed. Check backend logs.');
      setPhase('results');
    }
  }, [scanResult]);

  useEffect(() => clearTimers, [clearTimers]);

  // Summary - derived from backend scan results when available, else from local data
  const summary = scanResult
    ? {
        total:   scanResult.total,
        clean:   scanResult.results.filter(r => r.status === 'verified').length,
        review:  scanResult.results.filter(r => r.status === 'flagged').length,
        blocked: scanResult.results.filter(r => r.status === 'blocked').length,
        ghosts:  scanResult.flagged,
        saved:   scanResult.leakagePrevented,
        amount:  scanResult.results
          .filter(r => r.status === 'verified')
          .reduce((s, r) => s + (EMPLOYEES.find(e => e.id === r.id)?.salaryAmount || 0), 0),
      }
    : {
        total:   EMPLOYEES.length,
        clean:   EMPLOYEES.filter(e => e.status === 'verified').length,
        review:  EMPLOYEES.filter(e => e.status === 'flagged').length,
        blocked: EMPLOYEES.filter(e => e.status === 'blocked').length,
        ghosts:  EMPLOYEES.filter(e => e._pattern).length,
        saved:   EMPLOYEES.filter(e => e._pattern).reduce((s, e) => s + e.salaryAmount, 0),
        amount:  EMPLOYEES.filter(e => e.status === 'verified').reduce((s, e) => s + e.salaryAmount, 0),
      };

  return {
    phase, progress, analyzed, total,
    escrow, squadStep, summary, scanResult, error,
    startScan, lockEscrow, reset,
  };
}
