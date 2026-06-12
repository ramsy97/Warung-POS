import React, { useState, useEffect } from 'react';
import { FileText, Calendar, TrendingUp, TrendingDown, DollarSign, Printer, Download } from 'lucide-react';
import api from '../api';

interface SalesLog {
  id: number;
  sale_date: string;
  total_amount: number;
  discount: number;
  final_amount: number;
  payment_method: string;
  payment_status: string;
  customer?: { name: string };
}

interface PurchaseLog {
  id: number;
  purchase_date: string;
  total_amount: number;
  payment_status: string;
  supplier?: { name: string };
}

interface ProfitLoss {
  revenue: number;
  cogs: number; // HPP
  gross_profit: number;
  expenses: number; // operating outflow
  net_profit: number;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases' | 'pl'>('sales');
  
  // Date filters
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [sales, setSales] = useState<SalesLog[]>([]);
  const [purchases, setPurchases] = useState<PurchaseLog[]>([]);
  const [pl, setPl] = useState<ProfitLoss | null>(null);
  
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(`${endDate}T23:59:59`).toISOString(),
      };

      if (activeTab === 'sales') {
        const res = await api.get('/api/reports/sales', { params });
        setSales(res.data);
      } else if (activeTab === 'purchases') {
        const res = await api.get('/api/reports/purchases', { params });
        setPurchases(res.data);
      } else if (activeTab === 'pl') {
        const res = await api.get('/api/reports/profit-loss', { params });
        setPl(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab, startDate, endDate]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrintReceipt = (saleId: number) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/sales/${saleId}/pdf`;
    window.open(url, '_blank');
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    let path = '';
    if (activeTab === 'sales') {
      path = `/api/reports/sales/export/${format}`;
    } else if (activeTab === 'purchases') {
      path = `/api/reports/purchases/export/${format}`;
    } else if (activeTab === 'pl') {
      path = `/api/reports/profit-loss/export/${format}`;
    }

    const params = {
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(`${endDate}T23:59:59`).toISOString(),
    };

    try {
      const response = await api.get(path, {
        params,
        responseType: 'blob',
      });

      const blobType = format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

      const blob = new Blob([response.data], { type: blobType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const reportName = activeTab === 'pl' ? 'laba_rugi' : activeTab;
      const fileExt = format === 'excel' ? 'xlsx' : 'pdf';
      const filename = `laporan_${reportName}_${dateStr}.${fileExt}`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Gagal mengekspor laporan. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Laporan Bisnis</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Audit Keuangan, Penjualan, dan Pengadaan Barang</p>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => handleExport('excel')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl shadow-sm transition-all uppercase tracking-wider"
          >
            <Download className="h-4 w-4" /> EXPORT EXCEL
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded-xl shadow-sm transition-all uppercase tracking-wider"
          >
            <FileText className="h-4 w-4" /> EXPORT PDF
          </button>
        </div>
      </div>

      {/* Date Filters & Tab choices */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Tab Selection */}
        <div className="flex bg-slate-55 dark:bg-slate-800 p-1 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'sales'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Laporan Penjualan
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'purchases'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Laporan Pembelian
          </button>
          <button
            onClick={() => setActiveTab('pl')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'pl'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Laba Rugi (P&L)
          </button>
        </div>

        {/* Date Inputs */}
        <div className="flex gap-3 items-center w-full md:w-auto select-none">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 sm:flex-initial text-xs font-semibold bg-slate-55 dark:bg-slate-800 border-none rounded-xl px-3 py-2 focus:outline-none text-slate-700 dark:text-slate-350"
          />
          <span className="text-xs font-extrabold text-slate-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 sm:flex-initial text-xs font-semibold bg-slate-55 dark:bg-slate-800 border-none rounded-xl px-3 py-2 focus:outline-none text-slate-700 dark:text-slate-350"
          />
        </div>

      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      ) : (
        /* Report Rendered Content panels */
        <div className="transition-all duration-300">
          
          {/* Tab 1: Sales Report */}
          {activeTab === 'sales' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-6">ID POS</th>
                    <th className="py-4 px-6">PELANGGAN</th>
                    <th className="py-4 px-6">TIPE BAYAR</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6">DISKON</th>
                    <th className="py-4 px-6">TOTAL AKHIR</th>
                    <th className="py-4 px-6 text-center">TINDAKAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                        Tidak ada transaksi penjualan di rentang tanggal terpilih.
                      </td>
                    </tr>
                  ) : (
                    sales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-850/10 transition-colors">
                        <td className="py-4 px-6 font-bold">
                          <span className="text-slate-850 dark:text-slate-250 block">POS-{s.id}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5 block">{new Date(s.sale_date).toLocaleString('id-ID')}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-355">
                          {s.customer?.name || 'Pelanggan Umum'}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400">
                          {s.payment_method}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            s.payment_status === 'Lunas' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-455'
                          }`}>
                            {s.payment_status}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-rose-500">
                          {s.discount > 0 ? formatCurrency(s.discount) : '-'}
                        </td>
                        <td className="py-4 px-6 font-black text-slate-800 dark:text-white">
                          {formatCurrency(s.final_amount)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handlePrintReceipt(s.id)}
                            className="p-2 text-slate-450 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Reprint Struk PDF"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Purchases Report */}
          {activeTab === 'purchases' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-6">ID FAKTUR</th>
                    <th className="py-4 px-6">SUPPLIER</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6">TOTAL BELANJA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold">
                        Tidak ada transaksi pembelian di rentang tanggal terpilih.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-850/10 transition-colors">
                        <td className="py-4.5 px-6 font-bold">
                          <span className="text-slate-850 dark:text-slate-250 block">BELI-{p.id}</span>
                          <span className="text-[9px] text-slate-400 mt-0.5 block">{new Date(p.purchase_date).toLocaleString('id-ID')}</span>
                        </td>
                        <td className="py-4.5 px-6 font-semibold text-slate-700 dark:text-slate-355">
                          {p.supplier?.name || 'Supplier'}
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            p.payment_status === 'Lunas' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-455'
                          }`}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 font-black text-slate-800 dark:text-white">
                          {formatCurrency(p.total_amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Profit & Loss Statement */}
          {activeTab === 'pl' && pl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Detailed P&L Book */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Laporan Laba Rugi</h3>
                  <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Perhitungan pendapatan bersih warung</p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  {/* Revenue */}
                  <div className="py-3.5 flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-emerald-500" /> Penjualan Bersih (Revenue)</span>
                    <span className="text-emerald-600 font-extrabold">{formatCurrency(pl.revenue)}</span>
                  </div>
                  {/* COGS / HPP */}
                  <div className="py-3.5 flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5"><TrendingDown className="h-4 w-4 text-rose-455" /> Harga Pokok Penjualan (HPP / COGS)</span>
                    <span className="text-rose-500 font-extrabold">-{formatCurrency(pl.cogs)}</span>
                  </div>
                  {/* Gross Profit */}
                  <div className="py-4 flex justify-between items-center font-extrabold text-slate-800 dark:text-white">
                    <span>LABA KOTOR (Gross Profit)</span>
                    <span className="text-sky-600 dark:text-sky-400">{formatCurrency(pl.gross_profit)}</span>
                  </div>
                  {/* Operating Expenses */}
                  <div className="py-3.5 flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5"><TrendingDown className="h-4 w-4 text-amber-500" /> Beban Operasional & Kas Outflow</span>
                    <span className="text-rose-500 font-extrabold">-{formatCurrency(pl.expenses)}</span>
                  </div>
                  {/* Net Profit */}
                  <div className="py-5 flex justify-between items-center font-black text-sm text-slate-850 dark:text-white border-t-2 border-double border-slate-200 dark:border-slate-800">
                    <span>LABA BERSIH (Net Profit)</span>
                    <span className={pl.net_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {formatCurrency(pl.net_profit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Widget Visuals */}
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ringkasan Margin Laba</h4>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-emerald-400">
                      {pl.revenue > 0 ? ((pl.net_profit / pl.revenue) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-slate-450 font-semibold leading-normal">
                      Margin Keuntungan Bersih (Net Profit Margin) terhadap total penjualan kotor di periode ini.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Reports;
