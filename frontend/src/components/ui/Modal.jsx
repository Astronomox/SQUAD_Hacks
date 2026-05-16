import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const sizeCls = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className={`relative bg-white rounded-2xl shadow-elevated border border-ink-200 w-full ${sizeCls}`}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-ink-200">
                <h3 className="font-display font-bold text-[17px] text-ink-900">{title}</h3>
                <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-ink-100 text-ink-500">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="p-5">{children}</div>
            {footer && <div className="p-5 border-t border-ink-200 flex items-center justify-end gap-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
