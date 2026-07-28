import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowDownLeft, ArrowUpRight, Plus, Calendar } from 'lucide-react';
import api from '../api';

interface CashTransaction {
  id: number;
  tx_type: string;
  amount: number;
  category: string;
  notes: string;
  tx_date: string;
  reference_id?: number;
}

interface CashSummary {
  inflow: number;
  outflow: number;
  balance: number;
  logs: CashTransaction[];
}

const Cash: React.FC = () => {
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [txType, setTxType] = useState('In');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('Sales In');
  const [notes, setNotes] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCashBook = async () => {
    try {
      const res = await api.get('/api/cash/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashBook();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (amount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari Rp 0.');
      return;
    }

    const payload = {
      tx_type: txType,
      amount,
      category,
      notes
    };

    try {
      await api.post('/api/cash/transaction', payload);
      setSuccessMsg('Transaksi kas berhasil dicatat.');
      setAmount(0);
      setNotes('');
      fetchCashBook();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal mencatat transaksi kas.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Buku Kas & Keuangan</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Laporan Arus Kas Masuk, Keluar, dan Pengeluaran Operasional</p>
      </div>

      {/* Cash Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Cash Balance */}
        <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-sky-500/10 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-100">Saldo Kas Aktif</p>
            <h3 className="text-2xl font-black">{formatCurrency(summary?.balance || 0)}</h3>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white w-max block">Net Cash</span>
          </div>
          <DollarSign className="h-10 w-10 text-white/30 shrink-0" />
        </div>

        {/* Cash Inflow */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Kas Masuk</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{formatCurrency(summary?.inflow || 0)}</h3>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 w-max">
              <ArrowDownLeft className="h-3 w-3" /> Debit
            </span>
          </div>
          <ArrowDownLeft className="h-9 w-9 text-emerald-500 shrink-0 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-1.5" />
        </div>

        {/* Cash Outflow */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Kas Keluar</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{formatCurrency(summary?.outflow || 0)}</h3>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center gap-0.5 w-max">
              <ArrowUpRight className="h-3 w-3" /> Kredit
            </span>
          </div>
          <ArrowUpRight className="h-9 w-9 text-rose-500 shrink-0 bg-rose-50 dark:bg-rose-950/40 rounded-xl p-1.5" />
        </div>

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
        
        {/* Record Transaction Form (Left) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-max space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-sky-500" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Catat Arus Kas Manual</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Tipe Mutasi Kas</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setTxType('In'); setCategory('Sales In'); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    txType === 'In'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-650 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-450'
                  }`}
                >
                  Kas Masuk (In)
                </button>
                <button
                  type="button"
                  onClick={() => { setTxType('Out'); setCategory('Operational Out'); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    txType === 'Out'
                      ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-650 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-450'
                  }`}
                >
                  Kas Keluar (Out)
                </button>
              </div>
            </div>

            {/* Category selection based on type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Kategori Kas</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-bold bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-sky-500 text-slate-800 dark:text-slate-250"
              >
                {txType === 'In' ? (
                  <>
                    <option value="Sales In">Omzet Penjualan (Sales)</option>
                    <option value="Modal In">Suntikan Modal Owner</option>
                    <option value="Debt Payment In">Pelunasan Piutang Pelanggan</option>
                    <option value="Other In">Lainnya (Masuk)</option>
                  </>
                ) : (
                  <>
                    <option value="Operational Out">Biaya Operasional (Listrik/Air/Sewa)</option>
                    <option value="Purchase Out">Belanja Barang/Faktur Supplier</option>
                    <option value="Salary Out">Gaji Karyawan</option>
                    <option value="Debt Payment Out">Cicilan / Bayar Hutang Supplier</option>
                    <option value="Prive Out">Penarikan Pribadi Owner (Prive)</option>
                    <option value="Other Out">Lainnya (Keluar)</option>
                  </>
                )}
              </select>
            </div>

            {/* Nominal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nominal (Rp)</label>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Catatan</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan pelengkap..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:bg-slate-850 dark:hover:bg-slate-100 transition-all"
            >
              SIMPAN TRANSAKSI KAS
            </button>
          </form>
        </div>

        {/* Ledger Table (Right) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Jurnal Kas / Mutasi Buku Kas</h3>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Histori mutasi kas masuk dan kas keluar terperinci</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-6">ID / JENIS KAS</th>
                  <th className="py-4 px-6">NOMINAL</th>
                  <th className="py-4 px-6">KATEGORI JURNAL</th>
                  <th className="py-4 px-6">CATATAN</th>
                  <th className="py-4 px-6">TANGGAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {!summary || summary.logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      Belum ada data jurnal keuangan kas.
                    </td>
                  </tr>
                ) : (
                  summary.logs.map((log) => {
                    const isIn = log.tx_type === 'In';
                    return (
                      <tr key={log.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-850/10 transition-colors">
                        <td className="py-4 px-6 font-bold">
                          <span className="text-slate-850 dark:text-slate-250 block">ID: #{log.id}</span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase inline-block mt-0.5 ${
                            isIn 
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450'
                          }`}>
                            Kas {isIn ? 'Masuk' : 'Keluar'}
                          </span>
                        </td>
                        <td className={`py-4 px-6 font-black ${isIn ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isIn ? '+' : '-'}{formatCurrency(log.amount)}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400">
                          {log.category}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400">
                          {log.notes}
                          {log.reference_id && (
                            <span className="block text-[10px] text-slate-400 font-normal">Reff ID: {log.reference_id}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-semibold">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.tx_date).toLocaleDateString('id-ID', { dateStyle: 'short' })}
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

export default Cash;
