import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Trash2, Search, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultFile {
  id: number;
  name: string;
  date: string;
  size: string;
  category: string;
}

export const HealthVault: React.FC = () => {
  const { currentUser } = useApp();
  
  // Load files from localStorage unique to user
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>(() => {
    const key = `medibridge_health_vault_files_${currentUser.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    // Default seed data
    return [
      { id: 1, name: 'Cardiology_MRI_Scan.pdf', date: '2026-05-15', size: '12.4 MB', category: 'Scans' },
      { id: 2, name: 'Complete_Blood_Panel.pdf', date: '2026-06-01', size: '2.1 MB', category: 'Lab Reports' },
      { id: 3, name: 'Vaccination_Record.pdf', date: '2026-01-10', size: '840 KB', category: 'Certificates' },
      { id: 4, name: 'Lisinopril_Prescription_May.pdf', date: '2026-05-20', size: '1.2 MB', category: 'Prescriptions' }
    ];
  });

  const [uploading, setUploading] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Scans');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Save to localStorage whenever files change
  useEffect(() => {
    const key = `medibridge_health_vault_files_${currentUser.id}`;
    localStorage.setItem(key, JSON.stringify(vaultFiles));
  }, [vaultFiles, currentUser]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      const newFile: VaultFile = {
        id: Date.now(),
        name: newFileName.endsWith('.pdf') ? newFileName : `${newFileName}.pdf`,
        date: new Date().toISOString().split('T')[0],
        size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
        category: uploadCategory
      };
      setVaultFiles(prev => [newFile, ...prev]);
      setNewFileName('');
    }, 1200);
  };

  const deleteFile = (id: number) => {
    setVaultFiles(prev => prev.filter(f => f.id !== id));
  };

  const categories = ['All', 'Scans', 'Lab Reports', 'Certificates', 'Prescriptions', 'User Uploads'];

  const filteredFiles = vaultFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || file.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-sans">Health Vault</h2>
        <p className="text-xs text-slate-400 mt-1">Encrypt, organize, and inspect medical documents and historical diagnostics.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0b1120] border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                activeCategory === cat
                  ? 'bg-[#1e293b] text-emerald-400 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Upload Document</h3>
          <form onSubmit={handleUpload} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Document Title</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. Annual_Physical_Report"
                className="w-full glass-input text-xs"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full glass-input bg-[#0b1120] text-xs py-2"
              >
                <option value="Scans">Scans</option>
                <option value="Lab Reports">Lab Reports</option>
                <option value="Certificates">Certificates</option>
                <option value="Prescriptions">Prescriptions</option>
                <option value="User Uploads">User Uploads</option>
              </select>
            </div>

            <button type="submit" disabled={uploading} className="glass-btn-primary w-full text-xs py-2 mt-2 flex items-center justify-center gap-2">
              {uploading ? (
                <>
                  <RefreshIcon className="w-3.5 h-3.5 animate-spin" /> Uploading & Encrypting...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-black" /> Upload New File
                </>
              )}
            </button>
          </form>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-[10px] text-slate-500 font-sans leading-relaxed">
            <p className="font-bold text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> AES-256 Cloud Encryption
            </p>
            <p>All clinical documents are parsed locally. Private health telemetry complies strictly with HIPAA and GDPR.</p>
          </div>
        </div>

        {/* Files Listing */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Secure Documents</h3>
            <span className="text-[10px] text-slate-500 font-mono">{filteredFiles.length} secure files</span>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {filteredFiles.length > 0 ? (
                filteredFiles.map(file => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-cyan-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 truncate max-w-xs">{file.name}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-sans">
                          <span>{file.date}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                          <span>•</span>
                          <span className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400 text-[9px] uppercase font-bold tracking-wider">{file.category}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteFile(file.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-16">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs font-semibold">No secure files found.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Try relaxing your search query or choosing another category tab.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export default HealthVault;
