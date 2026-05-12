import React from 'react';
import { FileText, Calendar, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocumentCard({ data, onClick, isDark }) {
  const extracted = data.extracted_data || {};
  const typeStr = extracted.document_type || extracted.type || "Unknown Document";
  const nameStr = extracted.customer_name || extracted.borrower_name || extracted.name ||
    extracted.account_holder || extracted.account_holder_name || extracted.full_name || "Unknown Customer";
  const amountStr = extracted.loan_amount || extracted.due_amount || extracted.balance || extracted.total_amount;

  let dateStr = "Extracted Successfully";
  if (data.created_at) {
    const d = new Date(data.created_at);
    dateStr = d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  }

  const typeBadgeBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.07)';
  const typeBadgeColor = isDark ? '#9ca3af' : '#3b82f6';
  const typeBadgeBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(59,130,246,0.2)';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass p-5 rounded-2xl cursor-pointer group"
      style={{ transition: 'box-shadow 0.2s' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.12)' }}>
          <FileText size={22} className="text-blue-500" />
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wider"
          style={{ background: typeBadgeBg, color: typeBadgeColor, border: `1px solid ${typeBadgeBorder}` }}>
          {typeStr.replace(/_/g, ' ')}
        </span>
      </div>

      <h3 className="text-base font-bold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
        {nameStr}
      </h3>
      <p className="text-sm truncate mb-4" style={{ color: 'var(--text-secondary)' }}>
        {data.filename}
      </p>

      <div className="flex items-center gap-3 text-xs pt-4"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        {amountStr && (
          <div className="flex items-center gap-1">
            <Building size={13} />
            <span>{amountStr}</span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto whitespace-nowrap">
          <Calendar size={13} />
          <span>{dateStr}</span>
        </div>
      </div>
    </motion.div>
  );
}
