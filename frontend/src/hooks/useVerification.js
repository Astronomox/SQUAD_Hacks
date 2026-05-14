import { useState, useCallback } from 'react';
import { verifyLiveness, disburseSalary, createEmployeeVA } from '../utils/aiService.js';
import { EMPLOYEES } from '../data/employees.js';

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
  const [step,         setStep]         = useState(0);
  const [result,       setResult]       = useState(null);
  const [disbursement, setDisbursement] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [disbursing,   setDisbursing]   = useState(false);
  const [error,        setError]        = useState(null);
  const [employeeVA,   setEmployeeVA]   = useState(null);

  const employee = EMPLOYEES.find(e => e.id === employeeId);

  const completeStep = useCallback((newStep) => setStep(newStep), []);

  // Called automatically after all 3 liveness steps pass
  const submitVerification = useCallback(async ({ livenessScore, faceMatchConfidence, spoofDetected }) => {
    setLoading(true);
    setError(null);
    try {
      const verdict = await verifyLiveness({
        employeeId, livenessScore, faceMatchConfidence, spoofDetected, stepsPassed: 3,
      });
      setResult(verdict);

      // Create per-employee VA for real Squad history tracking
      if (verdict.status === 'passed' && employee) {
        createEmployeeVA({
          employeeId:  employee.id,
          fullName:    employee.fullName,
          email:       `${employee.id.toLowerCase().replace(/-/g,'')}@verifyai.ng`,
          mobile:      '08012345678',
          bankAccount: employee.bankAccount || '0123456789',
        }).then(va => {
          if (va.success) setEmployeeVA(va);
        }).catch(() => {});
      }

      // Auto-disburse on pass
      if (verdict.status === 'passed' && employee) {
        const nipCode = NIP_MAP[employee.bankCode] || '000013';
        const transfer = await disburseSalary({
          employeeId,
          amount:        employee.salaryAmount,
          bankCode:      nipCode,
          accountNumber: employee.bankAccount || '0123456789',
          accountName:   employee.fullName,
          cycleId:       'PYC-2025-05',
        });
        setDisbursement(transfer);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [employeeId, employee]);

  // Manual disburse — callable from Payment tab button
  const triggerDisburse = useCallback(async () => {
    if (!employee || disbursement || disbursing) return;
    setDisbursing(true);
    setError(null);
    try {
      const nipCode = NIP_MAP[employee.bankCode] || '000013';
      const transfer = await disburseSalary({
        employeeId,
        amount:        employee.salaryAmount,
        bankCode:      nipCode,
        accountNumber: employee.bankAccount || '0123456789',
        accountName:   employee.fullName,
        cycleId:       'PYC-2025-05',
      });
      setDisbursement(transfer);
    } catch (err) {
      setError(err.message || 'Disbursement failed. Check backend logs.');
    } finally {
      setDisbursing(false);
    }
  }, [employeeId, employee, disbursement, disbursing]);

  const reset = useCallback(() => {
    setStep(0); setResult(null); setDisbursement(null); setError(null); setDisbursing(false); setEmployeeVA(null);
  }, []);

  return {
    step, result, disbursement, loading, disbursing, error, employeeVA,
    employee, completeStep, submitVerification, triggerDisburse, reset,
  };
}
