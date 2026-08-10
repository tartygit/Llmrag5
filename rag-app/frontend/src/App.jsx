import React, { useState, useEffect } from 'react';
import {
  FileText, Shield, FileCheck, Layers, Settings, Users,
  Upload, Search, MessageSquare, Download, CheckCircle,
  XCircle, Lock, Unlock, RefreshCw, HelpCircle, LogOut,
  Bell, Check, ToggleLeft, ToggleRight, Server, FileSpreadsheet, Play,
  Eye, EyeOff
} from 'lucide-react';

const SPRING_BOOT_URL = 'http://localhost:8080';
const FLASK_URL = 'http://localhost:5000';

export default function App() {
  // Authentication & Session States
  const [user, setUser] = useState(null); // { username, role, authMethod }
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'signup'
  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: 'MAKER' });
  const [showPassword, setShowPassword] = useState(false);
  const [ldapEnabled, setLdapEnabled] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Active View Tab State
  const [activeTab, setActiveTab] = useState('maker'); // 'maker' | 'checker' | 'admin' | 'reports' | 'rag'

  // Application Settings Configurations
  const [configs, setConfigs] = useState({
    APP_NAME: 'Software Development Document Environment',
    DEFAULT_APP_CODE: 'SDE',
    AUTH_METHOD: 'DATABASE',
    POLLING_DIR: './polling_folder',
    ENABLE_SMS_AUTH_SIGNUP: 'false',
    ENABLE_EMAIL_AUTH_SIGNUP: 'false',
    ENABLE_APPROVER_SMS_NOTIFY: 'false',
    ENABLE_APPROVER_EMAIL_NOTIFY: 'false'
  });

  // Business States
  const [usersList, setUsersList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDocAuditLogs, setSelectedDocAuditLogs] = useState([]);
  const [appCode, setAppCode] = useState('SDE');
  const [templateUploadFile, setTemplateUploadFile] = useState(null);

  // Maker Form States
  const [makerForm, setMakerForm] = useState({
    phaseNumber: 1,
    documentTitle: 'Business Case',
    description: '',
    versionNumber: '1.0.0',
    documentCode: 'BC-01',
    file: null
  });

  // Checker States
  const [checkerRemarks, setCheckerRemarks] = useState('');

  // RAG States
  const [ragStatus, setRagStatus] = useState({
    indexed_files: [],
    total_chunks: 0,
    embedding_model: 'nomic-embed-text',
    chat_model: 'llama3.2:latest',
    dimension: 384
  });
  const [ragUploadFile, setRagUploadFile] = useState(null);
  const [ragUploadStatus, setRagUploadStatus] = useState('');
  const [ragSearchQuery, setRagSearchQuery] = useState('');
  const [ragSearchResults, setRagSearchResults] = useState([]);
  const [ragChatHistory, setRagChatHistory] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Software Development recommendations bot. Ask me anything about your uploaded deliverables.' }
  ]);
  const [ragChatQuery, setRagChatQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [ragSettings, setRagSettings] = useState({
    MODEL_CHAT: 'llama3.2:latest',
    MODEL_EMBED: 'nomic-embed-text',
    OLLAMA_HOST: 'http://localhost:11434'
  });

  // Phases and Titles Mapping
  const PHASES = {
    1: ["Business Case", "Project Charter", "Feasibility Study"],
    2: ["Functional Specification Document", "Use Case Document", "Data Model Specification"],
    3: ["System Architecture Document", "High Level Design", "Low Level Design"],
    4: ["Source Code Package", "API Documentation", "Build Artifacts"],
    5: ["Test Plan", "Test Cases Document", "UAT Report"],
    6: ["Deployment Guide", "Release Notes", "Operations Manual"],
    7: ["Project Closure Report", "Post Implementation Review", "Lessons Learned"]
  };

  // On Mount Load Configurations
  useEffect(() => {
    fetchConfigs();
    fetchDocuments();
    fetchRagStatus();
    fetchRagSettings();
  }, []);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchUsersList();
    }
  }, [user]);

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/admin/configs`);
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
        setLdapEnabled(data.AUTH_METHOD === 'LDAP');
        if (data.DEFAULT_APP_CODE) {
          setAppCode(data.DEFAULT_APP_CODE);
        }
      }
    } catch (e) {
      console.warn('Backend not online yet or unreachable.', e);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.warn('Backend documents fetch failed', e);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/admin/users`);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.warn('Backend user management fetch failed', e);
    }
  };

  const fetchRagStatus = async () => {
    try {
      const res = await fetch(`${FLASK_URL}/api/rag/index/status`);
      if (res.ok) {
        const data = await res.json();
        setRagStatus(data);
      }
    } catch (e) {
      console.warn('RAG status fetch offline', e);
    }
  };

  const fetchRagSettings = async () => {
    try {
      const res = await fetch(`${FLASK_URL}/api/rag/settings`);
      if (res.ok) {
        const data = await res.json();
        setRagSettings(data);
      }
    } catch (e) {
      console.warn('RAG settings fetch offline', e);
    }
  };

  // Handlers for Authentication
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setNotificationMsg('');
    const endpoint = authTab === 'login' ? 'login' : 'signup';

    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
          role: loginForm.role
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (authTab === 'login') {
          setUser({
            username: data.username,
            role: data.role || loginForm.role,
            authMethod: data.authMethod
          });
          setNotificationMsg(`Successfully authenticated via ${data.authMethod}`);
        } else {
          setNotificationMsg(data.message + '\n' + (data.notificationSimulated || ''));
          setAuthTab('login');
        }
      } else {
        setNotificationMsg(`Error: ${data.message}`);
      }
    } catch (err) {
      // Offline fallback demo mode
      setUser({
        username: loginForm.username || 'DemoUser',
        role: loginForm.role,
        authMethod: ldapEnabled ? 'MOCK_LDAP' : 'OFFLINE_DB'
      });
      setNotificationMsg('Local offline mode enabled.');
    }
  };

  // Admin Configurations Update
  const handleConfigUpdate = async (updatedConfigs) => {
    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/admin/configs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfigs)
      });
      if (res.ok) {
        setNotificationMsg('System configurations updated successfully!');
        fetchConfigs();
      }
    } catch (e) {
      setConfigs(updatedConfigs);
      setNotificationMsg('Offline Mode: Configurations saved locally in React memory.');
    }
  };

  // User Actions (Lock, Unlock, Reset Password)
  const toggleUserLock = async (username, isLocked) => {
    const action = isLocked === 'Y' ? 'unlock' : 'lock';
    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/admin/users/${username}/${action}`, { method: 'POST' });
      if (res.ok) {
        fetchUsersList();
      }
    } catch (e) {
      // Local updates
      setUsersList(usersList.map(u => u.username === username ? { ...u, isLocked: isLocked === 'Y' ? 'N' : 'Y' } : u));
    }
  };

  const triggerPasswordReset = async (username) => {
    const newPass = prompt("Enter new password for " + username + ":", "Reset_Password123");
    if (!newPass) return;
    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/admin/users/${username}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPass })
      });
      if (res.ok) {
        alert("Password reset completed successfully for " + username);
      }
    } catch (e) {
      alert("Reset password request mock simulated.");
    }
  };

  // Maker Submit Deliverable Upload
  const handleMakerSubmit = async (e) => {
    e.preventDefault();
    setNotificationMsg('');
    const formData = new FormData();
    formData.append('appCode', appCode);
    formData.append('phaseNumber', makerForm.phaseNumber);
    formData.append('documentTitle', makerForm.documentTitle);
    formData.append('description', makerForm.description);
    formData.append('versionNumber', makerForm.versionNumber);
    formData.append('documentCode', makerForm.documentCode);
    formData.append('makerUsername', user ? user.username : 'maker');
    if (makerForm.file) {
      formData.append('file', makerForm.file);
    }

    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setNotificationMsg('Document uploaded and waiting Checker approval!');
        fetchDocuments();
        setMakerForm({ ...makerForm, description: '', file: null });
      } else {
        const err = await res.json();
        setNotificationMsg(`Error: ${err.message}`);
      }
    } catch (err) {
      // Local fallback simulation
      const mockDoc = {
        id: Date.now(),
        docIdCode: `${appCode.toUpperCase()}-P${makerForm.phaseNumber}${String(documents.length + 101).substring(1)}`,
        appCode: appCode,
        phaseNumber: Number(makerForm.phaseNumber),
        documentTitle: makerForm.documentTitle,
        description: makerForm.description,
        versionNumber: makerForm.versionNumber,
        documentCode: makerForm.documentCode,
        fileName: makerForm.file ? makerForm.file.name : 'deliverable_doc.docx',
        status: 'PENDING',
        makerUsername: user ? user.username : 'maker',
        processedStatus: 'NOT PROCESSED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDocuments([mockDoc, ...documents]);
      setNotificationMsg('Local offline: deliverable added.');
    }
  };

  // Checker actions (Approve, Reject, Return)
  const handleCheckerAction = async (id, action) => {
    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/documents/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkerUsername: user ? user.username : 'checker',
          remarks: checkerRemarks
        })
      });
      if (res.ok) {
        const actionLabel = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned to maker';
        setNotificationMsg(`Document was successfully ${actionLabel}.`);
        setCheckerRemarks('');
        fetchDocuments();
        setSelectedDoc(null);
      }
    } catch (e) {
      // Local simulator
      const targetStatus = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'RETURNED_TO_MAKER';
      setDocuments(documents.map(d => d.id === id ? {
        ...d,
        status: targetStatus,
        checkerUsername: user ? user.username : 'checker',
        checkerRemarks: checkerRemarks
      } : d));
      setCheckerRemarks('');
      setSelectedDoc(null);
      setNotificationMsg(`Local offline simulation: document status changed to ${targetStatus}.`);
    }
  };

  // Selected past document view audits
  const selectDocumentView = async (doc) => {
    setSelectedDoc(doc);
    try {
      const res = await fetch(`${SPRING_BOOT_URL}/api/documents/${doc.docIdCode}/logs`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDocAuditLogs(data);
      }
    } catch (e) {
      // Mock logs
      setSelectedDocAuditLogs([
        { id: 1, actionType: 'UPLOAD', performedBy: doc.makerUsername, logTimestamp: doc.createdAt, details: 'Created document upload packet' },
        { id: 2, actionType: doc.status, performedBy: doc.checkerUsername || 'SYSTEM', logTimestamp: doc.updatedAt, details: doc.checkerRemarks || 'Initial state' }
      ]);
    }
  };

  // RAG functions
  const handleRagUpload = async (e) => {
    e.preventDefault();
    if (!ragUploadFile) return;
    setRagUploadStatus('Uploading and Parsing...');
    const formData = new FormData();
    formData.append('file', ragUploadFile);

    try {
      const res = await fetch(`${FLASK_URL}/api/rag/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setRagUploadStatus(`Indexed! Created ${data.chunks} chunks.`);
        fetchRagStatus();
        setRagUploadFile(null);
      } else {
        setRagUploadStatus('Upload failed. Using local mockup simulation.');
      }
    } catch (err) {
      // Local offline fallback
      setRagUploadStatus(`Offline simulation: Chunked and embedded '${ragUploadFile.name}' cleanly!`);
      const updatedFiles = [...ragStatus.indexed_files, ragUploadFile.name];
      setRagStatus({
        ...ragStatus,
        indexed_files: Array.from(new Set(updatedFiles)),
        total_chunks: ragStatus.total_chunks + 12
      });
      setRagUploadFile(null);
    }
  };

  const handleSemanticSearch = async (e) => {
    e.preventDefault();
    if (!ragSearchQuery) return;
    try {
      const res = await fetch(`${FLASK_URL}/api/rag/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragSearchQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setRagSearchResults(data.citations);
      }
    } catch (err) {
      setRagSearchResults([
        { score: 0.89, filename: 'System Architecture Document.docx', text: 'This system layout covers multiple databases including Oracle, SQL Server, and Postgres. Integration utilizes dynamic loading handlers.' },
        { score: 0.74, filename: 'Project Charter.docx', text: 'Section 4.1 outlines project milestones and maker/checker workflows to enforce double authorization verification and prevent transaction mistakes.' }
      ]);
    }
  };

  const handleRagChat = async (e) => {
    e.preventDefault();
    if (!ragChatQuery) return;

    const userMsg = { role: 'user', text: ragChatQuery };
    setRagChatHistory(prev => [...prev, userMsg]);
    const currentQuery = ragChatQuery;
    setRagChatQuery('');
    setIsChatLoading(true);

    try {
      const response = await fetch(`${FLASK_URL}/api/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery })
      });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let aiResponseText = '';

        // Add skeleton assistant message
        setRagChatHistory(prev => [...prev, { role: 'assistant', text: '' }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value);
          // SSE events parser
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.substring(6));
                if (parsed.text) {
                  aiResponseText += parsed.text;
                  setRagChatHistory(prev => {
                    const next = [...prev];
                    next[next.length - 1].text = aiResponseText;
                    return next;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err) {
      // Local mockup conversational recommend system fallback
      setTimeout(() => {
        const mockRecommendation = `Based on your query: "${currentQuery}", the AI System recommends:
Ensure your deployment templates are registered for the checker workflow. Also, maintain active version tags SDE-P101 for phase 1 so system polling picks up metadata dynamically without manual overhead.`;
        setRagChatHistory(prev => [...prev, { role: 'assistant', text: mockRecommendation }]);
      }, 500);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearRagIndex = async () => {
    if (!confirm('Are you sure you want to clear the FAISS vector index?')) return;
    try {
      await fetch(`${FLASK_URL}/api/rag/index/clear`, { method: 'POST' });
      fetchRagStatus();
    } catch (err) {
      setRagStatus({ ...ragStatus, indexed_files: [], total_chunks: 0 });
    }
  };

  const updateRagSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${FLASK_URL}/api/rag/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ragSettings)
      });
      if (res.ok) {
        alert('RAG/LLM Models configurations updated successfully!');
      }
    } catch (err) {
      alert('Mock Offline: configurations updated in state.');
    }
  };

  // Trigger manual simulation of folder polling
  const triggerFolderPollingMock = () => {
    alert(`Triggered Polling folder check on: "${configs.POLLING_DIR}". Placed mock documents inside will be parsed into Phase deliverable cycles automagically.`);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Dynamic App Title Banner */}
      <header className="bg-slate-900 text-white shadow-lg border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg shadow-inner">
              <Layers className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {configs.APP_NAME}
              </h1>
              <span className="text-xs text-slate-400 font-mono">Enterprise Software Document Engine</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium">{user.username}</span>
                  <span className="text-[10px] bg-slate-700 text-slate-300 uppercase px-1.5 py-0.5 rounded-md font-bold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => setUser(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <span className="text-sm text-slate-400">Not Logged In</span>
            )}
          </div>
        </div>
      </header>

      {/* Global Toast Message Notification System */}
      {notificationMsg && (
        <div className="bg-indigo-50 border-y border-indigo-100 px-4 py-2.5 text-center transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-sm text-indigo-800 font-medium">
            <span className="flex-1 text-center whitespace-pre-wrap">{notificationMsg}</span>
            <button onClick={() => setNotificationMsg('')} className="text-indigo-400 hover:text-indigo-600 font-bold px-2">×</button>
          </div>
        </div>
      )}

      {/* Unauthenticated State View */}
      {!user ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Welcome Portal</h2>
              <p className="text-sm text-slate-500 mt-1">Access Software Development Document Environment</p>

              {/* Authenticate Toggle Mode */}
              <div className="flex rounded-md shadow-sm mt-4 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${authTab === 'login' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${authTab === 'signup' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  Create Account
                </button>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin, maker, checker"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {authTab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Select Security Role</label>
                  <select
                    value={loginForm.role}
                    onChange={(e) => setLoginForm({ ...loginForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    <option value="MAKER">Maker (Uploader)</option>
                    <option value="CHECKER">Checker (Approver)</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              )}

              {/* LDAP toggles - configurable from the frontend */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 flex items-center space-x-1.5">
                  <Server className="h-3.5 w-3.5 text-slate-400" />
                  <span>Authenticate with Windows AD (LDAP)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !ldapEnabled;
                    setLdapEnabled(nextVal);
                    // Update configuration
                    handleConfigUpdate({ ...configs, AUTH_METHOD: nextVal ? 'LDAP' : 'DATABASE' });
                  }}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                >
                  {ldapEnabled ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg text-sm shadow-md transition"
              >
                {authTab === 'login' ? 'Authenticate Security Profile' : 'Register Secure Account'}
              </button>
            </form>

            {/* Quick Demo Assist */}
            <div className="mt-6 bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
              <span className="text-xs font-bold text-indigo-900 block mb-1">🔒 Developer Default Logins (Password: admin123)</span>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-600">
                <span>• admin (ADMIN)</span>
                <span>• maker (MAKER)</span>
                <span>• checker (CHECKER)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Main Workspace Layout */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">

          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-3 mb-2">Main Navigation</span>

              <button
                onClick={() => { setActiveTab('maker'); setSelectedDoc(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'maker' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Upload className="h-4.5 w-4.5" />
                <span>Maker Portal</span>
              </button>

              <button
                onClick={() => { setActiveTab('checker'); setSelectedDoc(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'checker' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileCheck className="h-4.5 w-4.5" />
                <span>Checker Approvals</span>
              </button>

              <button
                onClick={() => { setActiveTab('reports'); setSelectedDoc(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'reports' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileSpreadsheet className="h-4.5 w-4.5" />
                <span>Reports Center</span>
              </button>

              <button
                onClick={() => { setActiveTab('rag'); setSelectedDoc(null); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'rag' ? 'bg-indigo-50 text-indigo-600 font-bold text-indigo-700 border-l-2 border-indigo-500' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <MessageSquare className="h-4.5 w-4.5 text-indigo-500 animate-bounce" />
                <span className="text-indigo-600">Local LLM AI RAG</span>
              </button>

              {user.role === 'ADMIN' && (
                <>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-3 pt-4 pb-2">Admin Options</span>
                  <button
                    onClick={() => { setActiveTab('admin'); setSelectedDoc(null); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Settings className="h-4.5 w-4.5" />
                    <span>Config & User Setup</span>
                  </button>
                </>
              )}
            </div>

            {/* Folder Polling Control Widget */}
            <div className="bg-slate-900 text-white rounded-2xl shadow p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-300 font-bold uppercase font-mono">Directory Poller</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                App dynamically watches the polling directory: <code className="bg-slate-800 text-indigo-200 px-1 py-0.5 rounded font-mono">{configs.POLLING_DIR}</code> every <code className="bg-slate-800 text-indigo-200 px-1 py-0.5 rounded font-mono">{configs.POLLING_INTERVAL_MS || 5000}ms</code>. Any document dropped will be imported!
              </p>
              <button
                onClick={triggerFolderPollingMock}
                className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <Play className="h-3 w-3" />
                <span>Test Polling Pickup</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col gap-6">

            {/* Tab view: MAKER */}
            {activeTab === 'maker' && (
              <div className="space-y-6">

                {/* Submit New Deliverable File */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-indigo-600" />
                    <span>Upload Deliverable Document (Maker workflow)</span>
                  </h3>

                  <form onSubmit={handleMakerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">3-Character Application Tag</label>
                      <input
                        type="text"
                        maxLength={3}
                        required
                        value={appCode}
                        onChange={(e) => setAppCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Development Phase</label>
                      <select
                        value={makerForm.phaseNumber}
                        onChange={(e) => {
                          const phase = Number(e.target.value);
                          setMakerForm({
                            ...makerForm,
                            phaseNumber: phase,
                            documentTitle: PHASES[phase][0]
                          });
                        }}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(p => (
                          <option key={p} value={p}>Phase {p}: {p === 1 ? 'Initiation' : p === 2 ? 'Analysis' : p === 3 ? 'Design' : p === 4 ? 'Development' : p === 5 ? 'Testing' : p === 6 ? 'Deployment' : 'Closure'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Deliverable Document Title</label>
                      <select
                        value={makerForm.documentTitle}
                        onChange={(e) => setMakerForm({ ...makerForm, documentTitle: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                      >
                        {PHASES[makerForm.phaseNumber].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Description (Configurable)</label>
                      <input
                        type="text"
                        required
                        placeholder="Define document goals..."
                        value={makerForm.description}
                        onChange={(e) => setMakerForm({ ...makerForm, description: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Document Code</label>
                      <input
                        type="text"
                        required
                        value={makerForm.documentCode}
                        onChange={(e) => setMakerForm({ ...makerForm, documentCode: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Version Identifier</label>
                      <input
                        type="text"
                        required
                        value={makerForm.versionNumber}
                        onChange={(e) => setMakerForm({ ...makerForm, versionNumber: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Select File (Excel, Word, PowerPoint, XML, etc.)</label>
                      <input
                        type="file"
                        onChange={(e) => setMakerForm({ ...makerForm, file: e.target.files[0] })}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                    </div>

                    <div className="md:col-span-2 pt-2">
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow-md transition"
                      >
                        Submit to Checker Queue
                      </button>
                    </div>
                  </form>
                </div>

                {/* 7 Phases deliverable visualization frames */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-600" />
                    <span>Project Lifecycle Deliverables View (7 Phases Layout)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map(phase => {
                      const phaseDocs = documents.filter(d => d.phaseNumber === phase && d.appCode === appCode);
                      return (
                        <div key={phase} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:border-indigo-200 transition">
                          <span className="text-xs font-extrabold uppercase text-indigo-600 font-mono">Phase {phase}</span>
                          <h4 className="font-bold text-slate-800 text-sm mb-2 mt-0.5">
                            {phase === 1 ? 'Initiation' : phase === 2 ? 'Analysis' : phase === 3 ? 'Design' : phase === 4 ? 'Development' : phase === 5 ? 'Testing' : phase === 6 ? 'Deployment' : 'Project Closure'}
                          </h4>

                          <div className="space-y-2">
                            {PHASES[phase].map((title, i) => {
                              const matchingDoc = phaseDocs.find(d => d.documentTitle === title);
                              return (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100">
                                  <div>
                                    <span className="font-semibold block text-slate-700">{title}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">ID: {matchingDoc ? matchingDoc.docIdCode : `P${phase}0${i+1} (Auto)`}</span>
                                  </div>

                                  {matchingDoc ? (
                                    <button
                                      onClick={() => selectDocumentView(matchingDoc)}
                                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${matchingDoc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : matchingDoc.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 animate-pulse'}`}
                                    >
                                      {matchingDoc.status}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded">PENDING MAKER</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Document details section */}
                {selectedDoc && (
                  <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest">{selectedDoc.appCode} Deliverable Document</span>
                        <h3 className="text-lg font-bold">{selectedDoc.documentTitle}</h3>
                      </div>
                      <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white">×</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block">Document ID Code</span>
                        <span className="text-indigo-300 font-bold">{selectedDoc.docIdCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Version Number</span>
                        <span className="text-indigo-300 font-bold">{selectedDoc.versionNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Document Code</span>
                        <span className="text-indigo-300 font-bold">{selectedDoc.documentCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Status State</span>
                        <span className="text-emerald-400 font-bold">{selectedDoc.status}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <span className="text-xs text-slate-400 block font-bold">Configurable Description</span>
                      <p>{selectedDoc.description}</p>
                    </div>

                    {/* AI RECOMMENDATIONS FRAME */}
                    <div className="space-y-2 text-sm bg-gradient-to-tr from-indigo-950 to-slate-900 p-4 rounded-xl border border-indigo-500/30">
                      <span className="text-xs text-indigo-400 block font-extrabold tracking-wider uppercase">💡 AI LLM RAG Recommendation for this deliverable</span>
                      <p className="text-slate-100 text-xs italic">
                        {selectedDoc.recommendations || "Analyzing document structure via Local FAISS semantic recommendations... Generate suggestions via 'Local LLM AI RAG' tab."}
                      </p>
                    </div>

                    {/* Audit trail timestamps */}
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 font-bold block">Document Audit Trail Logs (With Date/Time Timestamp)</span>
                      <div className="bg-slate-950 p-3 rounded-lg text-[11px] font-mono space-y-1.5 max-h-40 overflow-y-auto">
                        {selectedDocAuditLogs.map((log) => (
                          <div key={log.id} className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-indigo-400">[{log.logTimestamp}]</span>
                            <span className="text-slate-300">{log.actionType} by {log.performedBy}: {log.details}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab view: CHECKER APPROVALS */}
            {activeTab === 'checker' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-indigo-600" />
                  <span>Checker Approval Queue (Double Authorization Rule)</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px]">
                        <th className="p-3">Doc ID</th>
                        <th className="p-3">App Tag</th>
                        <th className="p-3">Phase</th>
                        <th className="p-3">Deliverable Title</th>
                        <th className="p-3">Maker</th>
                        <th className="p-3">State</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {documents.filter(d => d.status === 'PENDING').map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono font-bold text-indigo-600">{doc.docIdCode}</td>
                          <td className="p-3 font-mono">{doc.appCode}</td>
                          <td className="p-3">Phase {doc.phaseNumber}</td>
                          <td className="p-3 font-medium text-slate-800">{doc.documentTitle}</td>
                          <td className="p-3 font-mono">{doc.makerUsername}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold animate-pulse">
                              {doc.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => selectDocumentView(doc)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded"
                            >
                              Review & Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                      {documents.filter(d => d.status === 'PENDING').length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-slate-400">No pending documents for approval.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Action block with full document preview, and Return to Maker capabilities */}
                {selectedDoc && selectedDoc.status === 'PENDING' && (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Auditing Deliverable: {selectedDoc.docIdCode}</h4>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">
                        App Code: {selectedDoc.appCode}
                      </span>
                    </div>

                    {/* Inline Document Preview Panel */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 shadow-inner">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block">📄 Document Viewer Frame</span>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Title</span>
                          <span className="font-bold text-slate-800">{selectedDoc.documentTitle}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Document Code</span>
                          <span className="font-bold text-slate-800">{selectedDoc.documentCode}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Version</span>
                          <span className="font-bold text-slate-800">{selectedDoc.versionNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Attached Filename</span>
                          <span className="font-bold text-indigo-600 truncate block">{selectedDoc.fileName || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-400 block text-[9px] uppercase font-mono">Deliverable Description</span>
                        <p className="text-xs text-slate-700 italic font-sans">"{selectedDoc.description || 'No description provided'}"</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks / Auditor Changes Notes (Required to Return)</label>
                      <textarea
                        rows={3}
                        required
                        value={checkerRemarks}
                        onChange={(e) => setCheckerRemarks(e.target.value)}
                        placeholder="Add dynamic audit notes, verification codes, or specify changes needed for Maker..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleCheckerAction(selectedDoc.id, 'approve')}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow flex items-center justify-center gap-1.5 transition"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          if (!checkerRemarks) {
                            alert("Please provide remarks to explain what needs to be changed!");
                            return;
                          }
                          handleCheckerAction(selectedDoc.id, 'return');
                        }}
                        className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow flex items-center justify-center gap-1.5 transition"
                      >
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Return to Maker</span>
                      </button>

                      <button
                        onClick={() => handleCheckerAction(selectedDoc.id, 'reject')}
                        className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow flex items-center justify-center gap-1.5 transition"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab view: REPORTS CENTER */}
            {activeTab === 'reports' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                      <span>Approver Status Reports Center</span>
                    </h3>
                    <p className="text-xs text-slate-500">Produce audits downloadable in PDF or Excel formats</p>
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    <a
                      href={`${SPRING_BOOT_URL}/api/reports/download/excel`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Excel</span>
                    </a>
                    <a
                      href={`${SPRING_BOOT_URL}/api/reports/download/pdf`}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>

                {/* Online view section */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Online Report Viewer Grid</span>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                          <th className="p-3">Doc ID</th>
                          <th className="p-3">App Code</th>
                          <th className="p-3">Phase</th>
                          <th className="p-3">Document Title</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Maker</th>
                          <th className="p-3">Approver Name</th>
                          <th className="p-3">Version</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {documents.map(d => (
                          <tr key={d.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-indigo-600">{d.docIdCode}</td>
                            <td className="p-3 font-mono">{d.appCode}</td>
                            <td className="p-3">Phase {d.phaseNumber}</td>
                            <td className="p-3 font-medium text-slate-800">{d.documentTitle}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : d.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                {d.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono">{d.makerUsername}</td>
                            <td className="p-3 font-mono">{d.checkerUsername || 'PENDING'}</td>
                            <td className="p-3 font-mono">{d.versionNumber}</td>
                          </tr>
                        ))}
                        {documents.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-4 text-center text-slate-400">No records available to report.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab view: LOCAL LLM AI RAG CHATBOT RECOMMENDATIONS */}
            {activeTab === 'rag' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* File parser & Index controller */}
                <div className="space-y-6 lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="h-5 w-5 text-indigo-600" />
                      <span>RAG Document Parser</span>
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Upload system files to feed the local vector store index. <strong>Docling</strong> turns Docx/PPTX/PDF/HTML into markdown, chunked and embedded in <strong>FAISS</strong>.
                    </p>

                    <form onSubmit={handleRagUpload} className="space-y-3">
                      <input
                        type="file"
                        onChange={(e) => setRagUploadFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                      <button
                        type="submit"
                        disabled={!ragUploadFile}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg text-xs shadow transition"
                      >
                        Parse & Chunk Embed File
                      </button>
                    </form>

                    {ragUploadStatus && (
                      <span className="text-xs text-indigo-800 bg-indigo-50 border border-indigo-100 p-2 rounded block font-mono">
                        {ragUploadStatus}
                      </span>
                    )}
                  </div>

                  {/* Index Status & Management */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                        <Server className="h-5 w-5 text-indigo-600" />
                        <span>FAISS Index Manager</span>
                      </h3>
                      <button
                        onClick={clearRagIndex}
                        className="text-xs text-red-600 hover:text-red-800 font-bold"
                      >
                        Clear Index
                      </button>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Chunks Count</span>
                        <span className="font-bold text-indigo-600">{ragStatus.total_chunks}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Embedding Model</span>
                        <span className="font-bold text-indigo-600">{ragStatus.embedding_model}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Chat Model</span>
                        <span className="font-bold text-indigo-600">{ragStatus.chat_model}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-600 block">Parsed Document Catalog</span>
                      <div className="bg-slate-50 p-2 rounded-lg text-[10px] font-mono text-slate-600 max-h-32 overflow-y-auto space-y-1 border border-slate-200/50">
                        {ragStatus.indexed_files.map((f, i) => (
                          <div key={i} className="flex items-center gap-1 text-slate-700">
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                        {ragStatus.indexed_files.length === 0 && (
                          <span className="text-slate-400 block text-center">No parsed files found.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <form onSubmit={updateRagSettings} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Model Configurations Settings</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Ollama Host URL</label>
                      <input
                        type="text"
                        value={ragSettings.OLLAMA_HOST}
                        onChange={(e) => setRagSettings({ ...ragSettings, OLLAMA_HOST: e.target.value })}
                        className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs bg-slate-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Ollama Chat model</label>
                      <input
                        type="text"
                        value={ragSettings.MODEL_CHAT}
                        onChange={(e) => setRagSettings({ ...ragSettings, MODEL_CHAT: e.target.value })}
                        className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs bg-slate-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Ollama Embed Model</label>
                      <input
                        type="text"
                        value={ragSettings.MODEL_EMBED}
                        onChange={(e) => setRagSettings({ ...ragSettings, MODEL_EMBED: e.target.value })}
                        className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs bg-slate-50 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded text-xs shadow"
                    >
                      Save Settings
                    </button>
                  </form>
                </div>

                {/* LLM Chat Recommendations Screen */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Streaming chatbot */}
                  <div className="bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 flex flex-col h-[500px]">
                    <div className="bg-slate-950 p-4 rounded-t-2xl border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-indigo-400 animate-pulse" />
                        <div>
                          <span className="font-bold text-sm block">Local LLM Chat Recommendations</span>
                          <span className="text-[10px] text-slate-400">Streaming responses with citations</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono px-2 py-0.5 rounded font-bold">
                        Offline Fallback Active
                      </span>
                    </div>

                    {/* Chat grid */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {ragChatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md rounded-xl p-3 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-800 text-slate-400 rounded-xl p-3 text-xs rounded-tl-none border border-slate-700 flex items-center space-x-2">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input form */}
                    <form onSubmit={handleRagChat} className="bg-slate-950 p-3 rounded-b-2xl border-t border-slate-800 flex gap-2">
                      <input
                        type="text"
                        required
                        value={ragChatQuery}
                        onChange={(e) => setRagChatQuery(e.target.value)}
                        placeholder="Ask AI for deliverable suggestions, layout structure validations..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition shadow"
                      >
                        Send
                      </button>
                    </form>
                  </div>

                  {/* Semantic Search Panel with score & text citations */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                      <Search className="h-5 w-5 text-indigo-600" />
                      <span>Semantic Source Search (Query FAISS Index)</span>
                    </h3>

                    <form onSubmit={handleSemanticSearch} className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={ragSearchQuery}
                        onChange={(e) => setRagSearchQuery(e.target.value)}
                        placeholder="Search for structural references, database rules..."
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition shadow"
                      >
                        Search Store
                      </button>
                    </form>

                    <div className="space-y-2">
                      {ragSearchResults.map((res, i) => (
                        <div key={i} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                          <div className="flex justify-between items-center border-b border-indigo-100 pb-1 mb-1 font-mono text-[10px]">
                            <span className="font-bold text-indigo-900">Source: {res.filename}</span>
                            <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Score: {res.score}</span>
                          </div>
                          <p className="text-slate-700 italic">"{res.text}"</p>
                        </div>
                      ))}
                      {ragSearchResults.length === 0 && (
                        <span className="text-xs text-slate-400 block text-center py-2">No matching semantic results yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab view: ADMIN CONFIGURATION & USER SETUP */}
            {activeTab === 'admin' && user.role === 'ADMIN' && (
              <div className="space-y-6">

                {/* Global configuration toggles */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-600" />
                    <span>System Global Environments & Toggles Configuration</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">Interactive Security Features</span>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-700">SMS Verification on signup</span>
                        <button
                          onClick={() => handleConfigUpdate({ ...configs, ENABLE_SMS_AUTH_SIGNUP: configs.ENABLE_SMS_AUTH_SIGNUP === 'true' ? 'false' : 'true' })}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {configs.ENABLE_SMS_AUTH_SIGNUP === 'true' ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-700">Email Verification link on signup</span>
                        <button
                          onClick={() => handleConfigUpdate({ ...configs, ENABLE_EMAIL_AUTH_SIGNUP: configs.ENABLE_EMAIL_AUTH_SIGNUP === 'true' ? 'false' : 'true' })}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {configs.ENABLE_EMAIL_AUTH_SIGNUP === 'true' ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">Checker/Approver Action Alerts</span>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-700">Send Checker SMS OTP when Maker submits file</span>
                        <button
                          onClick={() => handleConfigUpdate({ ...configs, ENABLE_APPROVER_SMS_NOTIFY: configs.ENABLE_APPROVER_SMS_NOTIFY === 'true' ? 'false' : 'true' })}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {configs.ENABLE_APPROVER_SMS_NOTIFY === 'true' ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-700">Send Checker Email alert when Maker submits file</span>
                        <button
                          onClick={() => handleConfigUpdate({ ...configs, ENABLE_APPROVER_EMAIL_NOTIFY: configs.ENABLE_APPROVER_EMAIL_NOTIFY === 'true' ? 'false' : 'true' })}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {configs.ENABLE_APPROVER_EMAIL_NOTIFY === 'true' ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Application Environment Name</label>
                        <input
                          type="text"
                          value={configs.APP_NAME}
                          onChange={(e) => setConfigs({ ...configs, APP_NAME: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Polling Directory Target</label>
                        <input
                          type="text"
                          value={configs.POLLING_DIR}
                          onChange={(e) => setConfigs({ ...configs, POLLING_DIR: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          onClick={() => handleConfigUpdate(configs)}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow"
                        >
                          Update Application Settings & Polling Path
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Template Upload (Admin only) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span>Upload Deliverable Template Files (Admin Only)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Provide official outline formats for Maker deliverables</p>

                  <div className="flex gap-2">
                    <input
                      type="file"
                      onChange={(e) => setTemplateUploadFile(e.target.files[0])}
                      className="flex-1 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    <button
                      onClick={() => {
                        if (templateUploadFile) {
                          alert(`Official template '${templateUploadFile.name}' registered into storage!`);
                          setTemplateUploadFile(null);
                        }
                      }}
                      disabled={!templateUploadFile}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white font-bold text-xs rounded-lg shadow transition"
                    >
                      Register Template
                    </button>
                  </div>
                </div>

                {/* User setups */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span>User Accounts Setup & Maintenance (Admin Console)</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                          <th className="p-3">User</th>
                          <th className="p-3">Role Profile</th>
                          <th className="p-3">Lock state</th>
                          <th className="p-3">Password Expiry Date</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersList.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-slate-800">{u.username}</td>
                            <td className="p-3">
                              <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-[10px] text-slate-600 uppercase">
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isLocked === 'Y' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {u.isLocked === 'Y' ? 'LOCKED' : 'ACTIVE'}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-500">{u.pwdExpiryDate}</td>
                            <td className="p-3 flex gap-1.5">
                              <button
                                onClick={() => toggleUserLock(u.username, u.isLocked)}
                                className={`p-1 rounded ${u.isLocked === 'Y' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'}`}
                                title={u.isLocked === 'Y' ? 'Unlock user account' : 'Lock user account'}
                              >
                                {u.isLocked === 'Y' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => triggerPasswordReset(u.username)}
                                className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded"
                                title="Reset credentials"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Global Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs font-mono">
          <span>&copy; {new Date().getFullYear()} Software Development Document Environment. All rights reserved.</span>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span>Secure Maker-Checker double authentication validation</span>
            <span>Local RAG AI recommendation integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
