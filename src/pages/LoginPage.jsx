import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sbFetch } from '../supabase';
import { Lock, User, KeyRound, AlertTriangle, Settings, ArrowLeftRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('client'); // 'client' or 'super'
  const [clientName, setClientName] = useState('');
  const [password, setPassword] = useState('');
  const [superPassword, setSuperPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClientLogin = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch clients to authenticate
      const clients = await sbFetch('clients?select=*');
      
      if (!clients || clients.length === 0) {
        setError('لا يوجد عملاء مسجلين حالياً');
        setLoading(false);
        return;
      }

      // Find client with case-insensitive name match
      const client = clients.find(
        (c) => c.name.toLowerCase() === clientName.trim().toLowerCase()
      );

      if (client && client.password === password) {
        sessionStorage.setItem('client_id', client.id);
        sessionStorage.setItem('client_name', client.name);
        navigate('/dashboard');
      } else {
        setError('اسم العميل أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      console.error('Error during client login:', err);
      setError('حدث خطأ أثناء الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSuperLogin = (e) => {
    e.preventDefault();
    if (!superPassword.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setLoading(true);
    setError('');

    // Simulated check as requested ('0211ayub')
    if (superPassword === '0211ayub') {
      sessionStorage.setItem('super_authed', 'true');
      navigate('/super');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
    setLoading(false);
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setError('');
    setPassword('');
    setSuperPassword('');
    setClientName('');
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500/30 selection:text-indigo-200"
      dir="rtl"
      id="login-page-container"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        {/* Decorative ambient gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo/Icon Header */}
        <div className="flex flex-col items-center mb-8" id="login-header">
          <div className="bg-indigo-600/10 text-indigo-400 p-4 rounded-2xl border border-indigo-500/20 mb-3 sm:mb-4 shadow-sm animate-pulse">
            <Settings className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            🛠️ لوحة التحكم <span className="text-slate-400 font-normal text-sm">المشتركة</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {mode === 'client' ? 'تسجيل دخول لوحة تحكم العملاء المخصصة للـ COD' : 'تسجيل دخول المشرف العام والتحكم بالنظام'}
          </p>
        </div>

        {/* Error Alert Bar */}
        {error && (
          <div 
            className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-shake"
            id="login-error-alert"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* MODE A: CLIENT LOGIN */}
        {mode === 'client' ? (
          <form onSubmit={handleClientLogin} className="space-y-5" id="client-login-form">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">اسم العميل</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="مثال: amourshop"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 text-sm pr-10 pl-4 py-3 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 text-sm pr-10 pl-4 py-3 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/60 disabled:text-indigo-300 text-white font-medium text-sm py-3 px-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              id="client-login-submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <span>دخول لوحة التحكم</span>
              )}
            </button>
          </form>
        ) : (
          /* MODE B: SUPER ADMIN */
          <form onSubmit={handleSuperLogin} className="space-y-5" id="super-login-form">
            <div>
              <label className="block text-xs font-medium text-amber-400 mb-2 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                كلمة مرور المشرف العام
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={superPassword}
                  onChange={(e) => setSuperPassword(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-850 text-sm pr-10 pl-4 py-3 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-medium text-sm py-3 px-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              id="super-login-submit"
            >
              <span>دخول بصلاحيات كاملة 👑</span>
            </button>
          </form>
        )}

        {/* Toggle Mode Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-center text-xs" id="login-footer-actions">
          {mode === 'client' ? (
            <button
              onClick={() => toggleMode('super')}
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 focus:outline-none py-1 px-3 bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-800/80"
              id="toggle-to-super"
            >
              <span>دخول كمشرف العام 👑</span>
            </button>
          ) : (
            <button
              onClick={() => toggleMode('client')}
              className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5 focus:outline-none py-1 px-3 bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-800/80"
              id="toggle-to-client"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>العودة لتسجيل دخول العميل</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
