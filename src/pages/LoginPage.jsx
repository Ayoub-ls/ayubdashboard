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
      className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-4"
      dir="rtl"
      id="login-page-container"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        {/* Logo/Icon Header */}
        <div className="flex flex-col items-center mb-8" id="login-header">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl border border-blue-100 mb-4">
            <Settings className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
            🛠️ لوحة التحكم <span className="text-slate-400 font-normal text-sm">المشتركة</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {mode === 'client' ? 'تسجيل دخول لوحة تحكم العملاء المخصصة للـ COD' : 'تسجيل دخول المشرف العام والتحكم بالنظام'}
          </p>
        </div>

        {/* Error Alert Bar */}
        {error && (
          <div 
            className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs flex items-center gap-2"
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
              <label className="block text-xs font-semibold text-slate-700 mb-2">اسم العميل</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="مثال: amourshop"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-sm pr-10 pl-4 py-3 rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-sm pr-10 pl-4 py-3 rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
              id="client-login-submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              <label className="block text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                كلمة مرور المشرف العام
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={superPassword}
                  onChange={(e) => setSuperPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-sm pr-10 pl-4 py-3 rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
              id="super-login-submit"
            >
              <span>دخول بصلاحيات كاملة 👑</span>
            </button>
          </form>
        )}

        {/* Toggle Mode Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center text-xs" id="login-footer-actions">
          {mode === 'client' ? (
            <button
              onClick={() => toggleMode('super')}
              className="text-slate-500 hover:text-amber-600 transition-colors flex items-center gap-1.5 focus:outline-none py-1.5 px-4 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 hover:border-amber-200"
              id="toggle-to-super"
            >
              <span>دخول كمشرف العام 👑</span>
            </button>
          ) : (
            <button
              onClick={() => toggleMode('client')}
              className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 focus:outline-none py-1.5 px-4 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-200"
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
