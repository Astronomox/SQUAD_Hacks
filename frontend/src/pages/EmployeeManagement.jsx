import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Upload, Search, CheckCircle, XCircle, AlertCircle,
  Mail, Phone, CreditCard, Building2, RefreshCw, Send, ChevronDown, X
} from 'lucide-react';
import Spinner from '../components/ui/Spinner.jsx';
import { formatNaira } from '../utils/formatters.js';

const AI_BASE = import.meta.env.VITE_AI_URL || 'https://verifyaibe.onrender.com';

async function apiPost(path, body) {
  const r = await fetch(`${AI_BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

const DEPARTMENTS = [
  'Ministry of Education', 'Ministry of Health', 'Civil Service Commission',
  'Ministry of Works', 'Ministry of Finance', 'Ministry of Agriculture',
  'Ministry of Justice', 'Kogi State House of Assembly',
];
const BANKS = [
  { code: '058', name: 'GTBank' }, { code: '044', name: 'Access Bank' },
  { code: '011', name: 'First Bank' }, { code: '057', name: 'Zenith Bank' },
  { code: '033', name: 'UBA' }, { code: '076', name: 'Polaris Bank' },
  { code: '082', name: 'Keystone Bank' }, { code: '035', name: 'Wema Bank' },
];

// ─── Input component ──────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-[#737373] uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2.5 text-sm border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#E8501A] focus:ring-2 focus:ring-[#E8501A]/10 bg-white text-[#111111] placeholder-[#B0B0B0] transition-colors"
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2.5 text-sm border border-[#E4E4E0] rounded-lg focus:outline-none focus:border-[#E8501A] bg-white text-[#111111] transition-colors appearance-none"
    >
      {children}
    </select>
  );
}

// ─── NIN Badge ────────────────────────────────────────────────────────────────
function NINBadge({ status }) {
  const map = {
    VERIFIED:   { cls: 'bg-green-50 text-green-700 border-green-200', label: 'NIN Verified' },
    UNVERIFIED: { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'NIN Pending' },
    INVALID:    { cls: 'bg-red-50 text-red-700 border-red-200', label: 'NIN Invalid' },
  };
  const s = map[status] || map.UNVERIFIED;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.cls}`}>
      {status === 'VERIFIED' ? <CheckCircle size={9} /> : <AlertCircle size={9} />}
      {s.label}
    </span>
  );
}

// ─── Added Employee Card ──────────────────────────────────────────────────────
function EmpCard({ emp, onNotify, notifying }) {
  const initials = emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E4E4E0] rounded-xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E8501A]/10 flex items-center justify-center shrink-0">
            <span className="text-[#E8501A] text-sm font-bold">{initials}</span>
          </div>
          <div>
            <p className="font-medium text-[#111111] text-sm">{emp.fullName}</p>
            <p className="text-xs text-[#737373] font-mono">{emp.id}</p>
          </div>
        </div>
        <NINBadge status={emp.ninStatus} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {emp.email    && <span className="flex items-center gap-1 text-[#737373]"><Mail size={10} />{emp.email}</span>}
        {emp.phone    && <span className="flex items-center gap-1 text-[#737373]"><Phone size={10} />{emp.phone}</span>}
        {emp.department && <span className="flex items-center gap-1 text-[#737373] col-span-2"><Building2 size={10} />{emp.department}</span>}
        {emp.salaryAmount && <span className="flex items-center gap-1 text-[#737373]"><CreditCard size={10} />{formatNaira(emp.salaryAmount)}</span>}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#F4F4F2]">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          emp.status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          {emp.status === 'verified' ? 'Verified' : 'Pending Verification'}
        </span>
        <button
          onClick={() => onNotify(emp)}
          disabled={notifying === emp.id}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8501A] hover:bg-[#FF6B35] disabled:opacity-50 text-white text-xs rounded-lg font-medium transition-colors"
        >
          {notifying === emp.id ? <RefreshCw size={10} className="animate-spin" /> : <Send size={10} />}
          Send Invite
        </button>
      </div>
    </motion.div>
  );
}

// ─── CSV Cleaner ──────────────────────────────────────────────────────────────
function parseAndCleanCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [], removed: [] };

  const removed = [];
  let filtered = [...lines];

  // Remove last 2 rows
  const last2 = filtered.slice(-2);
  removed.push(...last2.map(r => ({ row: r, reason: 'Last 2 rows removed' })));
  filtered = filtered.slice(0, -2);

  // Parse headers
  const headers = filtered[0].split(',').map(h => h.trim().replace(/"/g, ''));

  // Remove Stats and Top Flag columns
  const dropCols = new Set();
  headers.forEach((h, i) => {
    if (/stats|top.flag/i.test(h)) dropCols.add(i);
  });
  const cleanHeaders = headers.filter((_, i) => !dropCols.has(i));

  // Map MIN → Employee ID, Employee ID → NIN
  const mappedHeaders = cleanHeaders.map(h => {
    if (/^min$/i.test(h))         return 'employee_id';
    if (/^employee.id$/i.test(h)) return 'nin';
    return h.toLowerCase().replace(/\s+/g, '_');
  });

  const rows = filtered.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const clean = vals.filter((_, i) => !dropCols.has(i));
    return Object.fromEntries(mappedHeaders.map((h, i) => [h, clean[i] || '']));
  });

  return { headers: mappedHeaders, rows, removed };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmployeeManagement() {
  const [tab,         setTab]         = useState('add');     // add | batch | cleaner
  const [added,       setAdded]       = useState([]);
  const [submitting,  setSubmitting]  = useState(false);
  const [notifying,   setNotifying]   = useState(null);
  const [toast,       setToast]       = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [sendState,   setSendState]   = useState({ nin:'', name:'', email:'', phone:'', sending:false, result:null, error:'' });
  const [cleanResult, setCleanResult] = useState(null);
  const [ninResult,   setNinResult]   = useState(null);

  // Add form state
  const [form, setForm] = useState({
    fullName: '', nin: '', email: '', phone: '',
    department: '', role: '', salaryAmount: '',
    bankCode: '', bankAccount: '', bankName: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const fileRef    = useRef();
  const csvFileRef = useRef();

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setFormErrors(e => ({ ...e, [k]: null }));
  }

  // ── Validate form ──────────────────────────────────────────────────────────
  function validateForm() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name required';
    if (form.nin && !/^\d{11}$/.test(form.nin.trim())) errs.nin = 'NIN must be 11 digits';
    if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.email && !form.phone) errs.email = 'Email or phone required';
    if (form.phone && !/^(\+234|0)[789][01]\d{8}$/.test(form.phone.replace(/[\s-]/g,''))) errs.phone = 'Invalid Nigerian phone number';
    if (form.salaryAmount && isNaN(parseFloat(form.salaryAmount))) errs.salaryAmount = 'Must be a number';
    return errs;
  }

  // ── Submit single employee ─────────────────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await apiPost('/employees/add', {
        ...form,
        salaryAmount: form.salaryAmount ? parseFloat(form.salaryAmount) : null,
      });
      if (res.success) {
        setAdded(a => [res.employee, ...a]);
        // Pre-fill Send Link tab with the new employee
        setSendState({ nin: res.employee.nin || res.employee.id, name: res.employee.fullName, email: res.employee.email || '', phone: res.employee.phone || '', sending: false, result: null, error: '' });
        setForm({ fullName:'',nin:'',email:'',phone:'',department:'',role:'',salaryAmount:'',bankCode:'',bankAccount:'',bankName:'' });
        showToast(`${res.employee.fullName} added — switching to Send Link…`);
        setTimeout(() => setTab('send'), 800);
      } else {
        showToast(res.detail?.errors?.join(', ') || 'Failed to add employee', 'error');
      }
    } catch { showToast('Backend offline', 'error'); }
    setSubmitting(false);
  }

  // ── NIN verify ────────────────────────────────────────────────────────────
  async function verifyNIN(emp) {
    if (!emp.nin) return;
    const res = await apiPost('/employees/verify-nin', { nin: emp.nin, employeeId: emp.id });
    setNinResult(res);
    if (res.success) {
      setAdded(a => a.map(e => e.id === emp.id ? { ...e, ninStatus: 'VERIFIED' } : e));
      showToast('NIN verified');
    } else {
      showToast(res.reason || 'NIN invalid', 'error');
    }
  }

  // ── Notify employee ───────────────────────────────────────────────────────
  async function notifyEmployee(emp) {
    setNotifying(emp.id);
    try {
      const res = await apiPost('/employees/notify', {
        employeeId: emp.id,
        fullName:   emp.fullName,
        email:      emp.email,
        phone:      emp.phone,
        verifyLink: /^\d{11}$/.test(emp.id)
          ? `${window.location.origin}/verify?nin=${emp.id}`
          : `${window.location.origin}/verify?id=${emp.id}`,
      });
      if (res.success) {
        const emailOk = res.results?.email?.sent;
        showToast(emailOk ? `Invite sent to ${emp.email}` : `Invite queued — ${res.results?.email?.reason || 'check SMTP config'}`);
      }
    } catch { showToast('Notification failed', 'error'); }
    setNotifying(null);
  }

  // ── Batch CSV upload ──────────────────────────────────────────────────────
  async function handleBatchFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g,'_'));

    const employees = lines.slice(1).filter(Boolean).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/"/g,''));
      const row = Object.fromEntries(headers.map((h,i) => [h,vals[i]||'']));
      return {
        fullName:     row.full_name || row.name || '',
        nin:          row.nin || '',
        email:        row.email || '',
        phone:        row.phone || row.phone_number || '',
        department:   row.department || '',
        role:         row.role || '',
        salaryAmount: row.salary_amount ? parseFloat(row.salary_amount) : null,
        bankCode:     row.bank_code || '',
        bankAccount:  row.bank_account || '',
        bankName:     row.bank_name || '',
      };
    });

    setSubmitting(true);
    try {
      const res = await apiPost('/employees/batch', employees);
      setBatchResult(res);
      showToast(`${res.added} employees added, ${res.failed} failed`);
    } catch { showToast('Batch upload failed', 'error'); }
    setSubmitting(false);
  }

  // ── CSV Cleaner ───────────────────────────────────────────────────────────
  async function handleCleanFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = parseAndCleanCSV(text);
    setCleanResult(result);
    showToast(`Cleaned: ${result.rows.length} rows, ${result.removed.length} rows removed`);
  }

  function downloadCleaned() {
    if (!cleanResult) return;
    const csv = [
      cleanResult.headers.join(','),
      ...cleanResult.rows.map(r => cleanResult.headers.map(h => r[h] || '').join(','))
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'cleaned_employees.csv';
    a.click();
  }

  const TABS = [
    { id: 'add',     label: 'Add Employee', icon: UserPlus },
    { id: 'send',    label: 'Send Link',    icon: Send },
    { id: 'batch',   label: 'Batch Upload', icon: Upload },
    { id: 'cleaner', label: 'Data Cleaner', icon: Search },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F4F2] p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-[#111111]">Employee Management</h1>
          <p className="text-sm text-[#737373] mt-0.5">Add employees, verify NIN, send onboarding invites</p>
        </div>
        <div className="bg-white border border-[#E4E4E0] rounded-xl px-4 py-2 text-center">
          <p className="text-lg font-bold text-[#E8501A]">{added.length}</p>
          <p className="text-[10px] text-[#737373]">Added this session</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-[#E4E4E0] rounded-xl overflow-hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              tab === id ? 'bg-[#E8501A] text-white' : 'text-[#737373] hover:text-[#111111] hover:bg-[#F4F4F2]'
            }`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {/* ── ADD EMPLOYEE ────────────────────────────────────────────── */}
        {tab === 'add' && (
          <motion.form key="add" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            onSubmit={handleAdd}
            className="bg-white border border-[#E4E4E0] rounded-xl p-5 space-y-4">
            <p className="text-sm font-medium text-[#111111]">Personal Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name *" error={formErrors.fullName}>
                <Input placeholder="Adaeze Okonkwo" value={form.fullName} onChange={e => setField('fullName', e.target.value)} />
              </Field>
              <Field label="NIN (11 digits)" error={formErrors.nin}>
                <Input placeholder="12345678901" maxLength={11} value={form.nin} onChange={e => setField('nin', e.target.value.replace(/\D/g,''))} />
              </Field>
              <Field label="Email Address" error={formErrors.email}>
                <Input type="email" placeholder="adaeze@kogi.gov.ng" value={form.email} onChange={e => setField('email', e.target.value)} />
              </Field>
              <Field label="Phone Number" error={formErrors.phone}>
                <Input placeholder="08012345678" value={form.phone} onChange={e => setField('phone', e.target.value)} />
              </Field>
            </div>

            <div className="border-t border-[#F4F4F2] pt-4">
              <p className="text-sm font-medium text-[#111111] mb-3">Employment Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Department">
                  <Select value={form.department} onChange={e => setField('department', e.target.value)}>
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </Field>
                <Field label="Role">
                  <Input placeholder="Senior Officer" value={form.role} onChange={e => setField('role', e.target.value)} />
                </Field>
                <Field label="Monthly Salary (₦)" error={formErrors.salaryAmount}>
                  <Input type="number" placeholder="185000" value={form.salaryAmount} onChange={e => setField('salaryAmount', e.target.value)} />
                </Field>
                <Field label="Bank">
                  <Select value={form.bankCode} onChange={e => {
                    const bank = BANKS.find(b => b.code === e.target.value);
                    setField('bankCode', e.target.value);
                    setField('bankName', bank?.name || '');
                  }}>
                    <option value="">Select bank…</option>
                    {BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                  </Select>
                </Field>
                <Field label="Account Number">
                  <Input placeholder="0123456789" maxLength={10} value={form.bankAccount} onChange={e => setField('bankAccount', e.target.value.replace(/\D/g,''))} />
                </Field>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#E8501A] hover:bg-[#FF6B35] disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-colors">
              {submitting ? <><Spinner size={16} /> Adding employee…</> : <><UserPlus size={14} /> Add Employee</>}
            </button>
          </motion.form>
        )}


        {/* ── SEND VERIFICATION LINK ────────────────────────────────────────── */}
        {tab === 'send' && (
          <motion.div key="send" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="bg-white border border-[#E4E4E0] rounded-xl p-5 space-y-4">

            <div>
              <p className="text-sm font-medium text-[#111111]">Send Verification Link</p>
              <p className="text-xs text-[#737373] mt-1">
                Enter the employee NIN. They will receive a unique link to complete face verification and activate salary.
              </p>
            </div>

            <div className="space-y-3">
              <Field label="Employee NIN *" error={sendState.error && sendState.nin.length < 11 ? sendState.error : ''}>
                <Input
                  placeholder="11-digit NIN"
                  maxLength={11}
                  value={sendState.nin}
                  onChange={e => setSendState(s => ({ ...s, nin: e.target.value.replace(/\D/g,''), result: null, error: '' }))}
                />
              </Field>
              <Field label="Full Name">
                <Input placeholder="Adaeze Okonkwo" value={sendState.name}
                  onChange={e => setSendState(s => ({ ...s, name: e.target.value }))} />
              </Field>
              <Field label="Email Address">
                <Input type="email" placeholder="adaeze@kogi.gov.ng" value={sendState.email}
                  onChange={e => setSendState(s => ({ ...s, email: e.target.value }))} />
              </Field>
              <Field label="Phone Number">
                <Input placeholder="08012345678" value={sendState.phone}
                  onChange={e => setSendState(s => ({ ...s, phone: e.target.value }))} />
              </Field>
            </div>

            {sendState.error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <XCircle size={12} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-700">{sendState.error}</p>
              </div>
            )}

            {sendState.result && (
              <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-green-700 flex items-center gap-1.5">
                    <CheckCircle size={12} /> Link generated & dispatched
                  </p>
                  <div className="bg-white rounded-lg px-3 py-2 font-mono text-[10px] text-[#E8501A] break-all">
                    {sendState.result.verifyUrl}
                  </div>
                  {sendState.result.results?.email?.sent && (
                    <p className="text-[10px] text-green-600">✓ Email sent to {sendState.result.results.email.to}</p>
                  )}
                  {sendState.result.results?.email?.sent === false && sendState.result.results?.email?.preview && (
                    <p className="text-[10px] text-yellow-600">⚠ Email preview only — configure SMTP on Render</p>
                  )}
                  {sendState.result.results?.sms?.sent && (
                    <p className="text-[10px] text-green-600">✓ SMS sent to {sendState.result.results.sms.to}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sendState.result.verifyUrl);
                    showToast('Link copied to clipboard');
                  }}
                  className="w-full py-2 border border-[#E4E4E0] rounded-lg text-xs text-[#737373] hover:text-[#111111] hover:border-[#E8501A] transition-colors flex items-center justify-center gap-1.5">
                  <Mail size={11} /> Copy verification link
                </button>
              </motion.div>
            )}

            <button
              disabled={sendState.nin.length !== 11 || sendState.sending}
              onClick={async () => {
                if (sendState.nin.length !== 11) { setSendState(s => ({ ...s, error: 'NIN must be exactly 11 digits' })); return; }
                if (!sendState.email && !sendState.phone) { setSendState(s => ({ ...s, error: 'Email or phone required to send the link' })); return; }
                setSendState(s => ({ ...s, sending: true, error: '', result: null }));
                try {
                  // 1. Register employee in backend store
                  const addRes = await apiPost('/employees/add', {
                    fullName:  sendState.name || `Employee ${sendState.nin}`,
                    nin:       sendState.nin,
                    email:     sendState.email || null,
                    phone:     sendState.phone || null,
                  });
                  const empId = addRes.employeeId || sendState.nin;

                  // 2. Fire notification
                  const notifyRes = await apiPost('/employees/notify', {
                    employeeId: empId,
                    fullName:   sendState.name || `Employee ${sendState.nin}`,
                    email:      sendState.email || null,
                    phone:      sendState.phone || null,
                    verifyLink: `${window.location.origin}/verify?nin=${sendState.nin}`,
                  });

                  setSendState(s => ({ ...s, sending: false, result: notifyRes }));
                  showToast('Verification link dispatched');
                } catch (err) {
                  setSendState(s => ({ ...s, sending: false, error: err.message || 'Failed — is backend running?' }));
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#E8501A] hover:bg-[#FF6B35] disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors">
              {sendState.sending ? <><RefreshCw size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Generate & Send Link</>}
            </button>

            <p className="text-center text-[10px] text-[#B0B0B0]">
              Link format: /verify?nin={sendState.nin || 'XXXXXXXXXXX'} · Unique per employee
            </p>
          </motion.div>
        )}

        {/* ── BATCH UPLOAD ─────────────────────────────────────────────── */}
        {tab === 'batch' && (
          <motion.div key="batch" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="space-y-4">
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 space-y-4">
              <p className="text-sm font-medium text-[#111111]">Upload CSV — max 500 employees</p>
              <p className="text-xs text-[#737373]">Required columns: <code className="bg-[#F4F4F2] px-1 rounded">full_name, email, phone</code>. Optional: <code className="bg-[#F4F4F2] px-1 rounded">nin, department, role, salary_amount, bank_code, bank_account</code></p>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[#E4E4E0] hover:border-[#E8501A] rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-[#B0B0B0] group-hover:text-[#E8501A] mx-auto mb-2 transition-colors" />
                <p className="text-sm text-[#737373]">Click to upload CSV</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleBatchFile} />
              </div>

              {submitting && <div className="flex items-center justify-center gap-2"><Spinner size={24} /><span className="text-sm text-[#737373]">Processing batch…</span></div>}

              {batchResult && (
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-green-700">{batchResult.added}</p>
                      <p className="text-xs text-green-600">Added</p>
                    </div>
                    <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-red-700">{batchResult.failed}</p>
                      <p className="text-xs text-red-600">Failed</p>
                    </div>
                  </div>
                  {batchResult.results?.filter(r => !r.success).map((r, i) => (
                    <div key={i} className="bg-red-50 rounded-lg px-3 py-2 text-xs text-red-700">
                      <strong>{r.name}</strong> — {r.errors?.errors?.join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── DATA CLEANER ─────────────────────────────────────────────── */}
        {tab === 'cleaner' && (
          <motion.div key="cleaner" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="space-y-4">
            <div className="bg-white border border-[#E4E4E0] rounded-xl p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-[#111111]">Employee Login Sheet Cleaner</p>
                <p className="text-xs text-[#737373] mt-1">Automatically removes last 2 rows, Stats row, Top Flag column. Maps MIN → Employee ID, Employee ID → NIN.</p>
              </div>

              <div
                onClick={() => csvFileRef.current?.click()}
                className="border-2 border-dashed border-[#E4E4E0] hover:border-[#E8501A] rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <Search className="w-8 h-8 text-[#B0B0B0] group-hover:text-[#E8501A] mx-auto mb-2 transition-colors" />
                <p className="text-sm text-[#737373]">Upload login sheet CSV to clean</p>
                <input ref={csvFileRef} type="file" accept=".csv" className="hidden" onChange={handleCleanFile} />
              </div>

              {cleanResult && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#F4F4F2] rounded-lg p-2.5 text-center">
                      <p className="font-bold text-[#111111]">{cleanResult.headers.length}</p>
                      <p className="text-[10px] text-[#737373]">Columns</p>
                    </div>
                    <div className="bg-[#F4F4F2] rounded-lg p-2.5 text-center">
                      <p className="font-bold text-[#111111]">{cleanResult.rows.length}</p>
                      <p className="text-[10px] text-[#737373]">Clean rows</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2.5 text-center">
                      <p className="font-bold text-red-600">{cleanResult.removed.length}</p>
                      <p className="text-[10px] text-red-500">Rows removed</p>
                    </div>
                  </div>

                  <div className="bg-[#F4F4F2] rounded-lg p-3 overflow-x-auto">
                    <p className="text-[10px] font-medium text-[#737373] mb-2">Column mapping:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cleanResult.headers.map(h => (
                        <span key={h} className="bg-white border border-[#E4E4E0] px-2 py-0.5 rounded text-[10px] font-mono text-[#E8501A]">{h}</span>
                      ))}
                    </div>
                  </div>

                  {cleanResult.removed.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-1">
                      <p className="text-[10px] font-medium text-yellow-700">Removed rows:</p>
                      {cleanResult.removed.map((r, i) => (
                        <p key={i} className="text-[10px] text-yellow-600 font-mono truncate">{r.reason}: {r.row.slice(0, 60)}…</p>
                      ))}
                    </div>
                  )}

                  <button onClick={downloadCleaned}
                    className="w-full py-2.5 bg-[#E8501A] text-white rounded-lg text-sm font-medium hover:bg-[#FF6B35] transition-colors">
                    Download Cleaned CSV
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added employees list */}
      {added.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#111111]">Added this session ({added.length})</p>
          {added.map(emp => (
            <EmpCard key={emp.id} emp={emp} onNotify={notifyEmployee} notifying={notifying} />
          ))}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-xl shadow-elevated text-sm font-medium text-white z-50 ${
              toast.type === 'error' ? 'bg-red-600' : 'bg-[#111111]'
            }`}>
            {toast.type === 'error' ? <XCircle size={14} /> : <CheckCircle size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
