import React, { useState, useEffect } from 'react';
import { Search, Calendar, User } from 'lucide-react';
import api from '../api';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
  user?: { username: string; full_name: string; role: string };
}

const Audit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/audit/logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
                          log.details.toLowerCase().includes(search.toLowerCase()) ||
                          (log.user && log.user.full_name.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Audit Trail / Log Aktivitas</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lacak Rekam Jejak Seluruh Aksi Pengguna di Sistem</p>
      </div>

      {/* Search filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari log berdasarkan aksi, rincian detail, atau nama karyawan..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-55 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500/20 focus:outline-none text-xs font-semibold text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="py-4 px-6">ID LOG</th>
              <th className="py-4 px-6">PENGGUNA</th>
              <th className="py-4 px-6">AKSI UTAMA</th>
              <th className="py-4 px-6">KETERANGAN / DETAIL</th>
              <th className="py-4 px-6">ALAMAT IP</th>
              <th className="py-4 px-6">WAKTU EKSEKUSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                  Tidak ada rekaman log aktivitas yang cocok.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-850/10 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-400">#{log.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-850 dark:text-slate-250 block">{log.user?.full_name || 'System'}</span>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">Role: {log.user?.role.replace('_', ' ') || 'None'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-md uppercase tracking-wider">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-450 leading-relaxed max-w-sm break-words">
                    {log.details}
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-400 font-semibold">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-4 px-6 text-slate-400 font-semibold">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Audit;
