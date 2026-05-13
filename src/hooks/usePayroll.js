// usePayroll — drives the upload → scan → results → escrow lifecycle.

import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPLOYEES, GHOST_EMPLOYEES, VERIFIED_EMPLOYEES, FLAGGED_EMPLOYEES, BLOCKED_EMPLOYEES } from '../data/employees.js';
import { createEscrow } from '../utils/squadMock.js';

// phases: idle → uploading → scanning → results → locking → locked
export function usePayroll() {
  const [phase,     setPhase]    = useState('idle');
  const [progress,  setProgress] = useState(0);     // 0..100 during upload
  const [analyzed,  setAnalyzed] = useState(0);     // 0..total during scan
  const [escrow,    setEscrow]   = useState(null);  // squad escrow response
  const [squadStep, setSquadStep] = useState(0);    // step index inside 'locking'
  const timers = useRef([]);

  const total = EMPLOYEES.length;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearInterval);
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setPhase('idle'); setProgress(0); setAnalyzed(0); setEscrow(null); setSquadStep(0);
  }, [clearTimers]);

  const startScan = useCallback(() => {
    clearTimers();
    setPhase('uploading'); setProgress(0); setAnalyzed(0);
  }, [clearTimers]);

  // upload progress
  useEffect(() => {
    if (phase !== 'uploading') return;
    const tid = setInterval(() => {
      setProgress((p) => {
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

  // scanning progress
  useEffect(() => {
    if (phase !== 'scanning') return;
    const tid = setInterval(() => {
      setAnalyzed((a) => {
        const next = a + 3 + Math.floor(Math.random() * 6);
        if (next >= total) {
          clearInterval(tid);
          setTimeout(() => setPhase('results'), 350);
          return total;
        }
        return next;
      });
    }, 55);
    timers.current.push(tid);
    return () => clearInterval(tid);
  }, [phase, total]);

  // Squad lock — sequence of mock API calls
  const lockEscrow = useCallback(async () => {
    setPhase('locking');
    setSquadStep(0);
    timers.current.push(setTimeout(() => setSquadStep(1), 900));
    timers.current.push(setTimeout(() => setSquadStep(2), 1800));
    timers.current.push(setTimeout(() => setSquadStep(3), 2700));

    const amount = VERIFIED_EMPLOYEES.reduce((s, e) => s + e.salaryAmount, 0);
    const resp   = await createEscrow('PYC-2025-05', amount);
    // Give the visual sequence time to finish
    timers.current.push(setTimeout(() => {
      setEscrow(resp.data);
      setPhase('locked');
    }, 3400));
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const summary = {
    total,
    clean:   VERIFIED_EMPLOYEES.length,
    review:  FLAGGED_EMPLOYEES.length,
    blocked: BLOCKED_EMPLOYEES.length,
    ghosts:  GHOST_EMPLOYEES.length,
    saved:   GHOST_EMPLOYEES.reduce((s, e) => s + e.salaryAmount, 0),
    amount:  VERIFIED_EMPLOYEES.reduce((s, e) => s + e.salaryAmount, 0),
  };

  return {
    phase, progress, analyzed, total, escrow, squadStep,
    summary,
    startScan, lockEscrow, reset,
  };
}
