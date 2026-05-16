import { useState, useCallback } from 'react';
import { verifyLiveness, disburseSalary } from '../utils/aiService.js';
import { EMPLOYEES } from '../data/employees.js';

// Squad Transfer API requires 6-digit NIP codes, not 3-digit bank codes
const NIP_MAP = {
  '058': '000013', // GTBank
  '044': '000014', // Access Bank
  '011': '000016', // First Bank
  '057': '000008', // Zenith Bank
  '033': '000004', // UBA
  '050': '000002', // EcoBank
  '035': '000017', // Wema Bank
  '039': '000018', // Sterling Bank
};

export function useVerification(employeeId) {
  const [step,         setStep]        = useState(0);
  const [result,       setResult]      = useState(null);
  const [disbursement, setDisbursement] = useState(null);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState(null);

  const employee = EMPLOYEES.find(e => e.id === employeeId);

  const completeStep = useCallback((newStep) => setStep(newStep), []);

  const submitVerification = useCallback(async ({ livenessScore, faceMatchConfidence, spoofDetected }) => {
    setLoading(true);
    setError(null);
    try {
      const verdict = await verifyLiveness({
        employeeId,
        livenessScore,
        faceMatchConfidence,
        spoofDetected,
        stepsPassed: 3,
      });
      setResult(verdict);

      if (verdict.status === 'passed' && employee) {
        const nipCode = NIP_MAP[employee.bankCode] || '000013';
        const transfer = await disburseSalary({
          employeeId,
          amount:        employee.salaryAmount,
          bankCode:      nipCode,
          accountNumber: employee.bankAccount,
          accountName:   employee.fullName,
          cycleId:       'PYC-2025-05',
        });
        setDisbursement(transfer);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeId, employee]);

  const reset = useCallback(() => {
    setStep(0); setResult(null); setDisbursement(null); setError(null);
  }, []);

  return { step, result, disbursement, loading, error, employee, completeStep, submitVerification, reset };
}
