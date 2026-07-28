import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Minus, Calendar } from 'lucide-react';
import api from '../api';

interface Product {
  id: number;
  sku: string;
  name: string;
  stock: number;
  unit: string;
}

interface StockMovement {
  id: number;
  product_id: number;
  qty: number;
  type: string;
  reason: string;
  created_at: string;
  product?: { name: string; sku: string };
  user?: { full_name: string };
}

const Stock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  
  // Adjustment Form
  const [selectedProduct, setSelectedProduct] = useState('');
  const [type, setType] = useState('In');
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('Stockopname');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      const [prodRes, movRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/stock/movements'),
      ]);
      setProducts(prodRes.data);
      setMovements(movRes.data);
      
      if (prodRes.data.length > 0) setSelectedProduct(prodRes.data[0].id.toString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (qty <= 0) {
      setErrorMsg('Jumlah penyesuaian harus lebih dari 0.');
      return;
    }

    const prodId = Number(selectedProduct);
    const prod = products.find(p => p.id === prodId);
    if (type === 'Out' && prod && prod.stock < qty) {
      setErrorMsg(`Stok saat ini (${prod.stock}) tidak mencukupi untuk pengurangan sebanyak ${qty}.`);
      return;
    }

    const payload = {
      product_id: prodId,
      qty: type === 'In' ? qty : -qty,
      type: type === 'In' ? 'Adjustment In' : 'Adjustment Out',
      reason
    };

    try {
      await api.post('/api/stock/adjust', payload);
      setSuccessMsg('Penyesuaian stok berhasil disimpan.');
      setQty(1);
      setReason('Stockopname');
      fetchData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal menyimpan penyesuaian stok.');
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Penyesuaian & Log Stok</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola Mutasi Inventaris dan Stockopname Mandiri</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-450 text-xs font-bold rounded-2xl">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/40 text-rose-600 dark:text-rose-450 text-xs font-bold rounded-2xl">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Adjust Stock Form (Left) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-max space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-sky-500" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Form Penyesuaian Stok</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Product selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Pilih Produk</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                required
                className="w-full text-xs font-bold bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-sky-500 text-slate-800 dark:text-slate-250"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Jenis Mutasi</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('In')}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1 ${
                    type === 'In'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-605 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-405'
                  }`}
                >
                  <Plus className="h-4 w-4" /> Masuk / Tambah
                </button>
                <button
                  type="button"
                  onClick={() => setType('Out')}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1 ${
                    type === 'Out'
                      ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-605 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-405'
                  }`}
                >
                  <Minus className="h-4 w-4" /> Keluar / Kurang
                </button>
              </div>
            </div>

            {/* Qty field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Jumlah Barang (Qty)</label>
              <input
                type="number"
                value={qty || ''}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
              />
            </div>

            {/* Reason selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Alasan Penyesuaian</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs font-bold bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-sky-500 text-slate-800 dark:text-slate-250"
              >
                <option value="Stockopname">Pencocokan Stok (Stockopname)</option>
                <option value="Barang Rusak">Barang Rusak / Pecah</option>
                <option value="Barang Kadaluarsa">Barang Kadaluarsa (Expired)</option>
                <option value="Salah Input">Koreksi Salah Input</option>
                <option value="Lainnya">Alasan Lainnya</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:bg-slate-850 dark:hover:bg-slate-100 transition-all"
            >
              SIMPAN ADJUSMENT
            </button>
          </form>
        </div>

        {/* Movements Ledger (Right) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Buku Mutasi / Log Stok</h3>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Laporan kronologis alur barang keluar masuk</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-6">PRODUK</th>
                  <th className="py-4 px-6">KATEGORI JURNAL</th>
                  <th className="py-4 px-6">KUANTITAS</th>
                  <th className="py-4 px-6">ALASAN / CATATAN</th>
                  <th className="py-4 px-6">WAKTU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      Belum ada data mutasi stok tercatat.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isIn = m.qty > 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-850/10 transition-colors">
                        <td className="py-4 px-6 font-bold">
                          <span className="text-slate-800 dark:text-slate-200 block">{m.product?.name || 'Produk'}</span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{m.product?.sku || 'SKU'}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            m.type.includes('Adjustment')
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                              : m.type.includes('Sale')
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }`}>
                            {m.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-black">
                          <span className={isIn ? 'text-emerald-600' : 'text-rose-500'}>
                            {isIn ? '+' : ''}{m.qty}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400">
                          {m.reason}
                          {m.user && <span className="block text-[10px] text-slate-400 font-normal">Oleh: {m.user.full_name}</span>}
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-semibold">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(m.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Stock;
