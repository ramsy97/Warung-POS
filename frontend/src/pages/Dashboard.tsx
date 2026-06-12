import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight, 
  Users, 
  Package, 
  ChevronRight, 
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

interface DashboardData {
  omzet_today: number;
  tx_today: number;
  omzet_month: number;
  profit_month: number;
  top_products: Array<{ name: string; qty: number }>;
  low_stock_count: number;
  low_stock_list: Array<{ sku: string; name: string; stock: number; unit: string }>;
  top_customers: Array<{ name: string; spent: number }>;
  chart_data: Array<{ date: string; sales: number }>;
}

const COLORS = ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#ec4899'];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/reports/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
          <span className="text-sm font-semibold text-slate-500">Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 p-8 text-center text-slate-500">
        Gagal memuat data analitik dashboard. Silakan periksa koneksi backend.
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Ringkasan Bisnis</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Laporan Real-Time Warung</p>
        </div>
        <div className="bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700/60 px-4 py-2 rounded-2xl text-xs font-extrabold text-sky-600 dark:text-sky-400">
          Hari Ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Widget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Omzet Hari Ini */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between group hover:border-sky-500/30 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Omzet Hari Ini</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{formatCurrency(data.omzet_today)}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 flex items-center gap-1 w-max">
              <TrendingUp className="h-3 w-3" /> Real-time
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Transaksi Hari Ini */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transaksi Hari Ini</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{data.tx_today} Trx</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center gap-1 w-max">
              <ShoppingBag className="h-3 w-3" /> Sukses
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Omzet Bulan Ini */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Omzet Bulan Ini</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{formatCurrency(data.omzet_month)}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 w-max">
              <TrendingUp className="h-3 w-3" /> Akumulatif
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Keuntungan Bersih (Estimasi) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between group hover:border-amber-500/30 transition-all duration-300">
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Bulan Ini</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{formatCurrency(data.profit_month)}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center gap-1 w-max">
              <Layers className="h-3 w-3" /> Margin Bersih
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Layers className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Charts & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Line Chart (Sales Trend) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Tren Penjualan</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grafik Penjualan 7 Hari Terakhir</p>
            </div>
            <Link 
              to="/reports" 
              className="text-xs font-bold text-sky-500 flex items-center gap-0.5 hover:underline"
            >
              Laporan Detail <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp ${v/1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(val), 'Penjualan']} 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '16px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products bar chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Produk Terlaris</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">5 Produk Penjualan Terbanyak</p>
          </div>
          {data.top_products.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Belum ada data penjualan.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {data.top_products.map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate w-44">{p.name}</span>
                    <span className="font-extrabold text-slate-500 dark:text-slate-400">{p.qty} terjual</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(100, (p.qty / Math.max(...data.top_products.map(x => x.qty))) * 100)}%`,
                        backgroundColor: COLORS[idx % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Low Stock & Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Low Stock Warning Alert panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                Stok Menipis
                {data.low_stock_count > 0 && (
                  <span className="h-5 px-2 bg-amber-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {data.low_stock_count}
                  </span>
                )}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Produk yang mencapai batas minimum stok</p>
            </div>
            <Link 
              to="/stock" 
              className="text-xs font-bold text-sky-500 flex items-center gap-0.5 hover:underline"
            >
              Urus Stok <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
            {data.low_stock_list.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Semua stok produk aman.
              </div>
            ) : (
              data.low_stock_list.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs group">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-500 transition-colors">{item.name}</h4>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">SKU: {item.sku}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold px-2 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
                      Stok: {item.stock} {item.unit}
                    </span>
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Customers Loyalty points panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                Pelanggan Setia
                <Users className="h-4 w-4 text-sky-400" />
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top 5 pelanggan dengan belanja terbanyak</p>
            </div>
            <Link 
              to="/customers" 
              className="text-xs font-bold text-sky-500 flex items-center gap-0.5 hover:underline"
            >
              Pelanggan <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
            {data.top_customers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Belum ada data transaksi pelanggan.
              </div>
            ) : (
              data.top_customers.map((c, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-extrabold text-xs">
                      #{idx + 1}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-500 transition-colors">{c.name}</span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    Total: {formatCurrency(c.spent)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
