import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Mail, Phone, MapPin, Award, X, Eye } from 'lucide-react';
import api from '../api';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  total_transactions: number;
  points: number;
}

interface Sale {
  id: number;
  sale_date: string;
  final_amount: number;
  payment_method: string;
  payment_status: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  
  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchSalesHistory = async (customerId: number) => {
    try {
      const res = await api.get(`/api/customers/${customerId}/sales`);
      setSalesHistory(res.data);
    } catch (err) {
      console.error('Failed to load sales history', err);
    }
  };

  const handleSelectCustomer = (c: Customer) => {
    // Prevent selecting Pelanggan Umum ID = 1 details as it has no specific logs
    if (c.id === 1) return;
    setSelectedCustomer(c);
    fetchSalesHistory(c.id);
  };

  const handleOpenCreate = () => {
    setActiveCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCustomer(c);
    setName(c.name);
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setAddress(c.address || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = { name, phone, email, address };

    try {
      if (activeCustomer) {
        await api.put(`/api/customers/${activeCustomer.id}`, payload);
      } else {
        await api.post('/api/customers', payload);
      }
      setModalOpen(false);
      fetchCustomers();
      setSelectedCustomer(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal menyimpan pelanggan.');
    }
  };

  const handleDelete = async (id: number, custName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 1) {
      alert('Pelanggan Umum bawaan sistem tidak boleh dihapus.');
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus pelanggan "${custName}"?`)) {
      try {
        await api.delete(`/api/customers/${id}`);
        fetchCustomers();
        if (selectedCustomer?.id === id) {
          setSelectedCustomer(null);
        }
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.detail || 'Gagal menghapus pelanggan.');
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Daftar Pelanggan</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola Keanggotaan dan Poin Reward Loyalty</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" /> TAMBAH PELANGGAN
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Customers Table (Left) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-6">NAMA PELANGGAN</th>
                  <th className="py-4 px-6">KONTAK</th>
                  <th className="py-4 px-6">POIN LOYALTY</th>
                  <th className="py-4 px-6 text-center">TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {customers.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => handleSelectCustomer(c)}
                    className={`transition-colors ${
                      c.id === 1 ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      selectedCustomer?.id === c.id 
                        ? 'bg-sky-50/20 dark:bg-sky-950/10 border-l-4 border-sky-500' 
                        : 'hover:bg-slate-55/40 dark:hover:bg-slate-850/20'
                    }`}
                  >
                    <td className="py-4.5 px-6 font-bold">
                      <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Users className="h-4 w-4 text-sky-400 shrink-0" />
                        {c.name}
                      </span>
                      {c.id === 1 && (
                        <span className="text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full ml-6 w-max uppercase block">Default</span>
                      )}
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone || '-'}</span>
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl font-extrabold inline-flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        {c.points} Poin
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {c.id !== 1 && (
                          <>
                            <button
                              onClick={(e) => handleOpenEdit(c, e)}
                              className="p-2 text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Edit Pelanggan"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(c.id, c.name, e)}
                              className="p-2 text-slate-450 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Hapus Pelanggan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Details History (Right panel) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-max space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Riwayat Belanja</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laporan transaksi belanja pelanggan terpilih</p>
          </div>

          {!selectedCustomer ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              Pilih salah satu pelanggan di tabel sebelah kiri untuk melihat riwayat belanja.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2 border border-slate-100 dark:border-slate-800 text-xs">
                <p className="font-extrabold text-slate-700 dark:text-slate-300">{selectedCustomer.name}</p>
                {selectedCustomer.address && (
                  <p className="text-slate-500 dark:text-slate-450 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" /> {selectedCustomer.address}</p>
                )}
                <div className="flex justify-between items-center pt-2 text-[11px] border-t border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-400">Total Akumulasi Belanja:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedCustomer.total_transactions)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Daftar Transaksi</p>
                {salesHistory.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Belum ada riwayat transaksi belanja untuk pelanggan ini.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {salesHistory.map((s) => (
                      <div key={s.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">ID POS: #{s.id}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(s.sale_date).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-extrabold text-slate-800 dark:text-white">{formatCurrency(s.final_amount)}</p>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            s.payment_status === 'Lunas' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450' 
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450'
                          }`}>
                            {s.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-800 overflow-hidden animate-in scale-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-55/50 dark:bg-slate-900/40">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">
                {activeCustomer ? 'EDIT PELANGGAN' : 'TAMBAH PELANGGAN BARU'}
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
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: Ibu Ratna"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0813-XXXX..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ratna@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Alamat Rumah</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat lengkap pelanggan..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white h-20 resize-none"
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
                  SIMPAN PELANGGAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
