import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import Button from '../ui/Button.jsx';

const REQUIRED = [
  { name: 'employee_id',         hint: 'EMP-00000' },
  { name: 'full_name',           hint: '' },
  { name: 'department',          hint: '' },
  { name: 'salary_amount',       hint: 'NGN' },
  { name: 'bank_account',        hint: '10 digits' },
  { name: 'enrollment_date',     hint: 'ISO 8601' },
];

const OPTIONAL = [
  { name: 'enrollment_batch_id', hint: 'Improves detection' },
  { name: 'last_attendance',     hint: 'YYYY-MM-DD' },
  { name: 'ip_at_enrollment',    hint: '' },
  { name: 'device_fingerprint',  hint: '' },
];

export default function CSVUploader({ onUpload }) {
  const inputRef = useRef(null);
  const [hover,  setHover] = useState(false);

  function handle(file) {
    // The demo doesn't actually parse the file — it triggers the canned scan.
    onUpload?.(file?.name || 'kogi_may_2025.csv');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-ink-200 rounded-xl shadow-card p-8"
    >
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setHover(true); }}
          onDragOver={(e)  => e.preventDefault()}
          onDragLeave={() => setHover(false)}
          onDrop={(e) => { e.preventDefault(); setHover(false); handle(e.dataTransfer.files[0]); }}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition min-h-[280px] grid place-items-center text-center p-10
            ${hover ? 'border-brand bg-brand-pale' : 'border-ink-200 bg-ink-100 hover:bg-brand-pale/40 hover:border-brand-border'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handle(e.target.files?.[0])}
          />
          <div>
            <div className="w-16 h-16 rounded-2xl bg-white shadow-card border border-ink-200 grid place-items-center mx-auto mb-5">
              <Upload size={28} className="text-brand" />
            </div>
            <h3 className="font-display font-bold text-[20px] text-ink-900">Drop payroll CSV here</h3>
            <p className="text-ink-500 mt-2 text-[13.5px] max-w-md mx-auto">
              Up to 50,000 employee records · UTF-8 encoded · .csv format
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button kind="primary" icon={<Upload size={15} />}>Browse files</Button>
              <Button kind="ghost" onClick={(e) => { e.stopPropagation(); handle(null); }}>Use demo dataset</Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-[11.5px] text-ink-500 font-mono">
              <FileSpreadsheet size={13} /> kogi_may_2025.csv · 200 rows · 142 KB
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold text-[15px] text-ink-900">Required columns</h4>
          <ul className="mt-3 space-y-1.5">
            {REQUIRED.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-[12.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                <span className="font-mono text-ink-900">{c.name}</span>
                {c.hint && <span className="text-ink-500 text-[11.5px] ml-auto">{c.hint}</span>}
              </li>
            ))}
          </ul>

          <h4 className="font-display font-bold text-[15px] text-ink-900 mt-6">Optional columns</h4>
          <ul className="mt-3 space-y-1.5">
            {OPTIONAL.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-[12.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-200"></span>
                <span className="font-mono text-ink-700">{c.name}</span>
                {c.hint && <span className="text-ink-500 text-[11.5px] ml-auto">{c.hint}</span>}
              </li>
            ))}
          </ul>

          <a
            onClick={(e) => {
              e.stopPropagation();
              const csv = [
                'employee_id,full_name,department,salary_amount,bank_account,enrollment_date,enrollment_batch_id,last_attendance,ip_at_enrollment,device_fingerprint',
                'EMP-00001,Adaeze Okonkwo,Ministry of Education,185000,0123456789,2024-01-15T09:00:00,BATCH-001,2025-04-30,192.168.1.1,DEV-ABC123',
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
              a.download = 'verifyai_template.csv'; a.click();
            }}
            className="mt-5 inline-flex items-center gap-1 text-[12.5px] text-brand-dark font-medium hover:underline cursor-pointer"
          >
            <Download size={13} /> Download CSV template
          </a>
        </div>
      </div>
    </motion.div>
  );
}
