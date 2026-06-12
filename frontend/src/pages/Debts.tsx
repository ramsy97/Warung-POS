import React, { useState, useEffect } from 'react';
import { TrendingDown, Calendar, CreditCard, DollarSign, X, Check } from 'lucide-react';
import api from '../api';

interface DebtPayment {
  id: number;
  payment_date: string;
  amount: number;
  notes: string;
}

interface Debt {
  id: number;
  supplier_id: number;
  purchase_id: number;
  total_amount: number;
  remaining_amount: number;
  status: string;
  due_date: string;
  supplier?: { name: string };
  payments: DebtPayment[];
}

const Debts: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pay Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activeDebt, setActiveDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [notes, setNotes] = useState('Pelunasan Cicilan Hutang');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDebts = async () => {
    try {
      const res = await api.get('/api/debts');
      setDebts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleOpenPay = (d: Debt) => {
    setActiveDebt(d);
    setPaymentAmount(d.remaining_amount);
    setNotes(`Pelunasan Cicilan Hutang Faktur #${d.purchase_id}`);
    setErrorMsg('');
    setSuccessMsg('');
    setPayModalOpen(true);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!activeDebt) return;
    if (paymentAmount <= 0) {
      setErrorMsg('Jumlah pembayaran harus lebih besar dari Rp 0.');
      return;
    }

    if (paymentAmount > activeDebt.remaining_amount) {
      setErrorMsg(`Jumlah pembayaran tidak boleh melebihi sisa hutang (${formatCurrency(activeDebt.remaining_amount)})`);
      return;
    }

    try {
      await api.post(`/api/debts/${activeDebt.id}/pay`, {
        amount: paymentAmount,
        notes
      });
      setSuccessMsg('Pembayaran cicilan hutang berhasil dicatat.');
      setPayModalOpen(false);
      fetchDebts();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal memproses pembayaran hutang.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const calculateTotalUnpaid = () => {
    return debts.reduce((sum, d) => sum + d.remaining_amount, 0);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Hutang Dagang (Supplier)</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pantau dan Bayar Saldo Hutang Pengadaan Inventaris</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 px-6 py-4 rounded-3xl flex items-center gap-4">
          <TrendingDown className="h-8 w-8 text-amber-500 shrink-0" />
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Sisa Hutang</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">{formatCurrency(calculateTotalUnpaid())}</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-450 text-xs font-bold rounded-2xl">
          {successMsg}
        </div>
      )}

      {/* Debts Table card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="py-4 px-6">ID BELI / SUPPLIER</th>
              <th className="py-4 px-6">TOTAL HUTANG</th>
              <th className="py-4 px-6">SISA HUTANG</th>
              <th className="py-4 px-6">JATUH TEMPO</th>
              <th className="py-4 px-6">STATUS</th>
              <th className="py-4 px-6 text-center">TINDAKAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {debts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                  Hebat! Tidak ada sisa hutang dagang.
                </td>
              </tr>
            ) : (
              debts.map((d) => {
                const isOverdue = new Date(d.due_date) < new Date() && d.status === 'Belum Lunas';
                return (
                  <tr key={d.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-850/10 transition-colors">
                    <td className="py-4.5 px-6 font-bold">
                      <span className="text-slate-850 dark:text-slate-250 block">Faktur Beli: #{d.purchase_id}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block mt-0.5">Supplier: {d.supplier?.name || 'Supplier'}</span>
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-slate-550 dark:text-slate-400">
                      {formatCurrency(d.total_amount)}
                    </td>
                    <td className="py-4.5 px-6 font-extrabold text-slate-800 dark:text-white">
                      {formatCurrency(d.remaining_amount)}
                    </td>
                    <td className="py-4.5 px-6 font-semibold">
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-500 font-black' : 'text-slate-500 dark:text-slate-400'}`}>
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {new Date(d.due_date).toLocaleDateString('id-ID', { dateStyle: 'short' })}
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        d.status === 'Lunas'
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex justify-center">
                        {d.status !== 'Lunas' ? (
                          <button
                            onClick={() => handleOpenPay(d)}
                            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-extrabold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <CreditCard className="h-3 w-3" /> BAYAR CICILAN
                          </button>
                        ) : (
                          <span className="text-emerald-500 font-bold flex items-center gap-0.5"><Check className="h-3.5 w-3.5" /> Lunas</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pay Debt Modal */}
      {payModalOpen && activeDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-800 overflow-hidden animate-in scale-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-55/50 dark:bg-slate-900/40">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">BAYAR CICILAN HUTANG</h3>
              <button onClick={() => setPayModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="px-6 py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold border-b border-rose-100 dark:border-rose-950/30">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlePaySubmit} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-55 dark:bg-slate-800/45 text-xs space-y-2 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-500">
                  <span>Supplier:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{activeDebt.supplier?.name}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Sisa Hutang:</span>
                  <span className="font-extrabold text-slate-850 dark:text-white">{formatCurrency(activeDebt.remaining_amount)}</span>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Jumlah Bayar (Rp)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Catatan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                  placeholder="Catatan pelunasan..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white h-20 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-350"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold shadow-md shadow-sky-500/10 active:scale-[0.98]"
                >
                  CATAT PEMBAYARAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Debts;
