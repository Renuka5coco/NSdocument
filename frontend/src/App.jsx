import React, { useState, useEffect } from 'react';
import { FileUp, History, LogOut, User, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import UploadModal from './components/UploadModal';
import DocumentCard from './components/DocumentCard';
import DocumentDetail from './components/DocumentDetail';
import AuthPage from './components/AuthPage';

const API_BASE = import.meta.env.PROD
  ? "https://doc-ai-8z7a.onrender.com"
  : "http://localhost:8000";

// ─── Theme Toggle Button ──────────────────────────────────────
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 border"
      style={{
        background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(251,191,36,0.15)',
        borderColor: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(251,191,36,0.4)',
      }}
    >
      {/* Track icons */}
      <Moon size={12} className="absolute left-1.5 text-blue-400" />
      <Sun size={12} className="absolute right-1.5 text-amber-400" />
      {/* Thumb */}
      <span
        className="w-5 h-5 rounded-full shadow-md flex items-center justify-center transition-all duration-300 absolute"
        style={{
          left: isDark ? '4px' : 'calc(100% - 24px)',
          background: isDark ? '#3b82f6' : '#f59e0b',
        }}
      >
        {isDark
          ? <Moon size={10} className="text-white" />
          : <Sun size={10} className="text-white" />}
      </span>
    </button>
  );
}

// ─── Main App ─────────────────────────────────────────────────
function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const token = localStorage.getItem('token');

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (!user || !token) return;
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocuments(response.data);
      } catch (error) {
        if (error.response?.status === 401) handleLogout();
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocuments();
  }, [user]);

  const handleAuth = (data) => {
    setUser({ name: data.name, email: data.email });
    setDocuments([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDocuments([]);
  };

  const handleUploadComplete = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
    setIsUploadOpen(false);
  };

  if (!user) {
    return <AuthPage onAuth={handleAuth} isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} />;
  }

  const headerBorder = isDark ? 'border-white/5' : 'border-slate-200';
  const badgeBg = isDark ? 'bg-white/5 border-white/10' : 'bg-blue-50 border-blue-100';
  const logoutStyle = isDark
    ? 'text-gray-400 hover:text-red-400 bg-white/5 border-white/10 hover:border-red-500/40'
    : 'text-slate-400 hover:text-red-500 bg-slate-50 border-slate-200 hover:border-red-300';
  const emptyBorder = isDark ? 'border-white/10' : 'border-slate-200';

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className={`flex items-center justify-between mb-12 pb-6 border-b ${headerBorder}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            AI Document Intelligence
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Automated entity extraction & processing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />

          <div className={`flex items-center gap-2 glass px-4 py-2 rounded-xl border ${badgeBg}`}>
            <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User size={14} className="text-blue-500" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {user.name}
            </span>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-medium text-white transition-all shadow-lg hover:shadow-blue-500/30"
          >
            <FileUp size={20} />
            Upload Document
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${logoutStyle}`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Document List */}
      <div className="flex gap-8">
        <div className="flex-1">
          <div className={`flex items-center gap-2 mb-6 border-b pb-4 ${headerBorder}`}>
            <History style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Documents
            </h2>
            {documents.length > 0 && (
              <span className="ml-auto text-xs bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full font-medium">
                {documents.length} docs
              </span>
            )}
          </div>

          {documents.length === 0 ? (
            <div className={`glass rounded-2xl p-12 text-center border-2 border-dashed ${emptyBorder}`}>
              <p style={{ color: 'var(--text-secondary)' }}>No documents processed yet.</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                Upload a PDF, DOCX, or Image to start extracting data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, idx) => (
                <DocumentCard
                  key={idx}
                  data={doc}
                  isDark={isDark}
                  onClick={() => setSelectedDoc(doc)}
                />
              ))}
            </div>
          )}
        </div>

        {selectedDoc && (
          <DocumentDetail
            doc={selectedDoc}
            isDark={isDark}
            onClose={() => setSelectedDoc(null)}
          />
        )}
      </div>

      {isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

export default App;
