import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Truck, Mail, Phone, MapPin, X } from 'lucide-react';
import api from '../api';

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  pic: string;
}

interface Purchase {
  id: number;
  purchase_date: string;
  total_amount: number;
  payment_status: string;
}

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);
  
  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pic, setPic] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/api/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchPurchaseHistory = async (supplierId: number) => {
    try {
      const res = await api.get(`/api/suppliers/${supplierId}/purchases`);
      setPurchaseHistory(res.data);
    } catch (err) {
      console.error('Failed to load purchase history', err);
    }
  };

  const handleSelectSupplier = (s: Supplier) => {
    setSelectedSupplier(s);
    fetchPurchaseHistory(s.id);
  };

  const handleOpenCreate = () => {
    setActiveSupplier(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setPic('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSupplier(s);
    setName(s.name);
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setAddress(s.address || '');
    setPic(s.pic || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = { name, phone, email, address, pic };

    try {
      if (activeSupplier) {
        await api.put(`/api/suppliers/${activeSupplier.id}`, payload);
      } else {
        await api.post('/api/suppliers', payload);
      }
      setModalOpen(false);
      fetchSuppliers();
      setSelectedSupplier(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal menyimpan supplier.');
    }
  };

  const handleDelete = async (id: number, supName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Apakah Anda yakin ingin menghapus supplier "${supName}"?`)) {
      try {
        await api.delete(`/api/suppliers/${id}`);
        fetchSuppliers();
        if (selectedSupplier?.id === id) {
          setSelectedSupplier(null);
        }
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.detail || 'Gagal menghapus supplier.');
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
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Daftar Supplier</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola Supplier dan Log Pengadaan Barang</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" /> TAMBAH SUPPLIER
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Suppliers List (Left) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-6">NAMA / PIC</th>
                  <th className="py-4 px-6">KONTAK</th>
                  <th className="py-4 px-6 text-center">TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 font-semibold">
                      Belum ada supplier yang ditambahkan.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr 
                      key={s.id} 
                      onClick={() => handleSelectSupplier(s)}
                      className={`cursor-pointer transition-colors ${
                        selectedSupplier?.id === s.id 
                          ? 'bg-sky-50/20 dark:bg-sky-950/10 border-l-4 border-sky-500' 
                          : 'hover:bg-slate-55/40 dark:hover:bg-slate-850/20'
                      }`}
                    >
                      <td className="py-4.5 px-6 font-bold">
                        <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-sky-400 shrink-0" />
                          {s.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold pl-6 block">PIC: {s.pic || '-'}</span>
                      </td>
                      <td className="py-4.5 px-6 font-semibold text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {s.phone || '-'}</span>
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {s.email || '-'}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={(e) => handleOpenEdit(s, e)}
                            className="p-2 text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit Supplier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(s.id, s.name, e)}
                            className="p-2 text-slate-450 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Hapus Supplier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Supplier Purchase History (Right Panel) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-max space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Riwayat Pengadaan</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laporan pembelian ke supplier terpilih</p>
          </div>

          {!selectedSupplier ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              Pilih salah satu supplier di tabel sebelah kiri untuk melihat riwayat pembelian.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2 border border-slate-100 dark:border-slate-800 text-xs">
                <p className="font-extrabold text-slate-700 dark:text-slate-300">{selectedSupplier.name}</p>
                {selectedSupplier.address && (
                  <p className="text-slate-500 dark:text-slate-450 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" /> {selectedSupplier.address}</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Daftar Transaksi</p>
                {purchaseHistory.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Belum ada riwayat pembelian untuk supplier ini.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {purchaseHistory.map((p) => (
                      <div key={p.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">ID Beli: #{p.id}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(p.purchase_date).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-extrabold text-slate-800 dark:text-white">{formatCurrency(p.total_amount)}</p>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            p.payment_status === 'Lunas' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450' 
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450'
                          }`}>
                            {p.payment_status}
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
                {activeSupplier ? 'EDIT SUPPLIER' : 'TAMBAH SUPPLIER BARU'}
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
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nama Perusahaan / Supplier</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: PT Indofood Tbk"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nama PIC</label>
                  <input
                    type="text"
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    placeholder="Nama Kontak"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Telepon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-3456..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sales@supplier.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Alamat Kantor</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat lengkap supplier..."
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
                  SIMPAN SUPPLIER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Suppliers;
