// useVerification — drives the employee liveness flow.
// Three stages auto-advance with timers; result can be forced via setOutcome
// so the demo page can preview success vs failure without real camera input.

import { useEffect, useRef, useState, useCallback } from 'react';
import { getEmployee } from '../data/employees.js';

const STAGES = ['detect', 'liveness', 'match'];

export function useVerification(initialEmployeeId = 'EMP-00001') {
  const [employeeId, setEmployeeId] = useState(initialEmployeeId);
  const [phase,      setPhase]      = useState('idle');   // idle | scanning | success | failed
  const [stage,      setStage]      = useState(0);        // 0..2
  const [outcome,    setOutcome]    = useState('success');// preview toggle
  const [reference,  setReference]  = useState(null);
  const timers = useRef([]);

  const employee = getEmployee(employeeId);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setPhase('scanning');
    setStage(0);
    timers.current.push(setTimeout(() => setStage(1), 1200));
    timers.current.push(setTimeout(() => setStage(2), 2500));
    timers.current.push(setTimeout(() => {
      setPhase(outcome);
      if (outcome === 'success') {
        const r = 'SQ-2025-VRF-' + String(Math.floor(Math.random() * 90000 + 10000));
        setReference(r);
      } else {
        setReference(null);
      }
    }, 3800));
  }, [outcome, clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setStage(0);
    setReference(null);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  return {
    employeeId, setEmployeeId,
    employee,
    phase, stage, outcome, setOutcome,
    reference,
    stages: STAGES,
    start, reset,
  };
}
