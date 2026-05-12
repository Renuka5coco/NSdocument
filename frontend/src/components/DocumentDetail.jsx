import React from 'react';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';

export default function DocumentDetail({ doc, onClose, isDark }) {
  const data = doc.extracted_data || {};

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(doc.extracted_data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.filename}.json`;
    a.click();
  };

  const fieldBg = isDark ? 'rgba(255,255,255,0.04)' : '#f8faff';
  const fieldBorder = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-96 glass rounded-2xl p-6 h-[calc(100vh-12rem)] overflow-y-auto sticky top-8 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6 pb-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-base font-bold truncate pr-4" style={{ color: 'var(--text-primary)' }}>
          {doc.filename}
        </h3>
        <button onClick={onClose} className="flex-shrink-0 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {Object.entries(data).map(([key, value]) => {
          if (value === null || value === undefined || key === "document_type") return null;
          return (
            <div key={key}>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}>
                {key.replace(/_/g, ' ')}
              </label>
              <div className="rounded-lg px-4 py-2.5 text-sm break-words"
                style={{ background: fieldBg, border: `1px solid ${fieldBorder}`, color: 'var(--text-primary)' }}>
                {String(value)}
              </div>
            </div>
          );
        })}
        {Object.values(data).every(val => !val) && (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            No specific data fields were extracted.
          </p>
        )}
      </div>

      <button onClick={handleExport}
        className="w-full mt-6 flex-shrink-0 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all text-blue-500 hover:text-blue-400 border"
        style={{ borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.06)' }}>
        <Download size={16} />
        Export as JSON
      </button>
    </motion.div>
  );
}
