import React, { useState } from 'react';
import { Store, UserCheck, ShieldAlert, Key } from 'lucide-react';
import api from '../api';

interface LoginProps {
  onLoginSuccess: (role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login-json', {
        username,
        password,
      });

      const { access_token, role, username: resUser, full_name } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', resUser);
      localStorage.setItem('fullName', full_name);

      onLoginSuccess(role);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Gagal masuk. Silakan periksa koneksi internet Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick login handler
  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 px-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl transition-all duration-300">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 mb-3 animate-bounce">
            <Store className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-wide">
            WARUNGKITA
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
            Sign In to Operasional
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold animate-shake">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase pl-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 focus:outline-none text-slate-800 dark:text-white font-semibold text-sm transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase pl-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 focus:outline-none text-slate-800 dark:text-white font-semibold text-sm transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-extrabold text-sm tracking-wider shadow-lg shadow-sky-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 mt-2"
          >
            {loading ? 'MENYAMBUNGKAN...' : 'MASUK SEKARANG'}
          </button>
        </form>

        {/* Quick Access / Demonstration shortcuts */}
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800/80 pt-6">
          <h4 className="text-center text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-4 flex items-center justify-center gap-1.5">
            <Key className="h-3.5 w-3.5" />
            Akses Cepat Demo
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-200/50 dark:border-slate-700/30"
            >
              <UserCheck className="h-3 w-3 text-rose-500" />
              Super Admin
            </button>
            <button
              onClick={() => handleQuickLogin('owner', 'owner123')}
              className="px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-200/50 dark:border-slate-700/30"
            >
              <UserCheck className="h-3 w-3 text-sky-500" />
              Owner
            </button>
            <button
              onClick={() => handleQuickLogin('kasir', 'kasir123')}
              className="px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-200/50 dark:border-slate-700/30"
            >
              <UserCheck className="h-3 w-3 text-emerald-500" />
              Kasir
            </button>
            <button
              onClick={() => handleQuickLogin('gudang', 'gudang123')}
              className="px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-200/50 dark:border-slate-700/30"
            >
              <UserCheck className="h-3 w-3 text-amber-500" />
              Staff Gudang
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
