import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Key, X } from 'lucide-react';
import api from '../api';

interface UserItem {
  id: number;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<UserItem | null>(null);
  
  // Form Fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('kasir');
  const [password, setPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setActiveUser(null);
    setUsername('');
    setFullName('');
    setRole('kasir');
    setPassword('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (u: UserItem) => {
    setActiveUser(u);
    setUsername(u.username);
    setFullName(u.full_name);
    setRole(u.role);
    setPassword(''); // leave blank if no password update
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const payload: any = {
      username,
      full_name: fullName,
      role
    };

    if (password) {
      payload.password = password;
    } else if (!activeUser) {
      setErrorMsg('Password wajib diisi untuk pengguna baru.');
      return;
    }

    try {
      if (activeUser) {
        await api.put(`/api/users/${activeUser.id}`, payload);
      } else {
        await api.post('/api/users', payload);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal menyimpan user.');
    }
  };

  const handleDelete = async (id: number, uName: string) => {
    if (uName === 'admin') {
      alert('Super Admin default ("admin") tidak boleh dihapus.');
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus user "${uName}"?`)) {
      try {
        await api.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.detail || 'Gagal menghapus user.');
      }
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">User Management</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Administrator Akun Karyawan & Pembagian Hak Akses</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" /> TAMBAH USER
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="py-4 px-6">USERNAME</th>
              <th className="py-4 px-6">NAMA LENGKAP</th>
              <th className="py-4 px-6">ROLE HAK AKSES</th>
              <th className="py-4 px-6">STATUS</th>
              <th className="py-4 px-6 text-center">TINDAKAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-850/10 transition-colors">
                <td className="py-4.5 px-6 font-bold text-slate-800 dark:text-slate-200">
                  @{u.username}
                </td>
                <td className="py-4.5 px-6 font-semibold text-slate-700 dark:text-slate-300">
                  {u.full_name}
                </td>
                <td className="py-4.5 px-6">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    u.role === 'super_admin'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                      : u.role === 'owner'
                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400'
                      : u.role === 'kasir'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                  }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4.5 px-6 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
                  <span className="text-slate-500">Aktif</span>
                </td>
                <td className="py-4.5 px-6 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-2 text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {u.username !== 'admin' && (
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        className="p-2 text-slate-450 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Hapus User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-800 overflow-hidden animate-in scale-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-55/50 dark:bg-slate-900/40">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">
                {activeUser ? 'EDIT USER' : 'TAMBAH USER BARU'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="px-6 py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold border-b border-rose-100 dark:border-rose-950/30">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Username Login</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={activeUser?.username === 'admin'}
                  placeholder="Contoh: kasir_ratna"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nama Lengkap Karyawan</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Contoh: Ratna Juwita"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Role / Hak Akses</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  disabled={activeUser?.username === 'admin'}
                  className="w-full text-xs font-bold bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500 text-slate-800 dark:text-slate-250 disabled:opacity-50"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="owner">Owner / Pemilik Warung</option>
                  <option value="kasir">Kasir Toko</option>
                  <option value="staff_gudang">Staff Gudang / Warehouse</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                  {activeUser ? 'Password Baru (Kosongkan jika tidak diganti)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-350"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold shadow-md shadow-sky-500/10 active:scale-[0.98]"
                >
                  SIMPAN USER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;
