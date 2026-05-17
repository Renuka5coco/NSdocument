import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function UploadModal({ onClose, onComplete }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("Auto-detect");
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState("");

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgressText("Uploading file...");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);

    try {
      setTimeout(() => setProgressText("Running AI Extraction..."), 1500);
      
      const API_BASE = import.meta.env.PROD 
      ? "https://doc-ai-8z7a.onrender.com" 
      : "http://localhost:8000"; 
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });

      setProgressText("Done!");
      setTimeout(() => {
        onComplete(response.data);
      }, 800);
      
    } catch (error) {
      console.error(error);
      const backendError = error.response?.data?.detail || error.message;
      alert(`Extraction failed: ${backendError}`);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass w-full max-w-lg rounded-3xl p-6 relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Upload Document</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Document Type Hint</label>
          <select 
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option>Auto-detect</option>
            <option>kyc</option>
            <option>loan_agreement</option>
            <option>bank_statement</option>
            <option>recovery_notice</option>
          </select>
        </div>

        {!uploading ? (
          <>
            <div 
              {...getRootProps()} 
              className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all"
              style={{
                borderColor: isDragActive ? '#3b82f6' : 'var(--border)',
                background: isDragActive ? 'rgba(59,130,246,0.06)' : 'transparent'
              }}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--surface)' }}>
                <UploadCloud size={28} className="text-blue-500" />
              </div>
              {file ? (
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
              ) : (
                <>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Drag & drop your file here</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Supports PDF, DOCX, PNG, JPEG</p>
                </>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleUpload}
                disabled={!file}
                className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary px-8 py-3 rounded-xl text-white font-medium transition-colors"
              >
                Start Extraction
              </button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            {progressText === "Done!" ? (
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
            ) : (
              <Loader2 size={64} className="text-blue-500 animate-spin mx-auto mb-6" />
            )}
            <h3 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>{progressText}</h3>
            <div className="w-full h-2 rounded-full mt-6 overflow-hidden relative"
              style={{ background: 'var(--surface)' }}>
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: progressText === "Done!" ? "100%" : "60%" }}
                transition={{ duration: 1.5 }}
                className="absolute top-0 left-0 h-full bg-blue-500"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
