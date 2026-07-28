import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, Truck } from 'lucide-react';
import api from '../api';

interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  cost_price: number;
  unit: string;
}

interface PurchaseItem {
  productId: number;
  qty: number;
  costPrice: number;
}

interface PurchaseLog {
  id: number;
  purchase_date: string;
  total_amount: number;
  payment_status: string;
  due_date?: string;
  supplier?: { name: string };
}

const Purchases: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<PurchaseLog[]>([]);
  
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('Lunas');
  const [dueDate, setDueDate] = useState<string>('');
  
  // Cart for purchase items
  const [cartItems, setCartItems] = useState<PurchaseItem[]>([]);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      const [supRes, prodRes, purRes] = await Promise.all([
        api.get('/api/suppliers'),
        api.get('/api/products'),
        api.get('/api/purchases'),
      ]);
      setSuppliers(supRes.data);
      setProducts(prodRes.data);
      setPurchases(purRes.data);
      
      if (supRes.data.length > 0) setSelectedSupplier(supRes.data[0].id.toString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setCartItems([
      ...cartItems,
      { productId: products[0].id, qty: 1, costPrice: products[0].cost_price }
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof PurchaseItem, val: number) => {
    const updated = [...cartItems];
    if (field === 'productId') {
      const prod = products.find(p => p.id === val);
      updated[index] = {
        productId: val,
        qty: updated[index].qty,
        costPrice: prod ? prod.cost_price : 0
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: val
      };
    }
    setCartItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.qty * item.costPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('Harap tambahkan minimal satu produk dalam daftar pembelian.');
      return;
    }

    if (paymentStatus === 'Hutang' && !dueDate) {
      setErrorMsg('Harap tentukan tanggal jatuh tempo untuk pembelian hutang/kredit.');
      return;
    }

    const payload = {
      supplier_id: Number(selectedSupplier),
      items: cartItems.map(i => ({
        product_id: i.productId,
        qty: i.qty,
        cost_price: i.costPrice
      })),
      payment_status: paymentStatus,
      due_date: paymentStatus === 'Hutang' ? new Date(dueDate).toISOString() : null
    };

    try {
      await api.post('/api/purchases', payload);
      setSuccessMsg('Pembelian berhasil dicatat. Stok otomatis bertambah.');
      setCartItems([]);
      setPaymentStatus('Lunas');
      setDueDate('');
      fetchData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal menyimpan transaksi pembelian.');
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
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Pencatatan Pembelian</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Input Faktur Barang Masuk dan Hutang Supplier</p>
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
        
        {/* Create Purchase Form (Left/Center) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-max space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-sky-500" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Formulir Faktur Pembelian</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pick Supplier */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Supplier</label>
                <div className="relative">
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    required
                    className="w-full text-xs font-semibold bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500 text-slate-750 dark:text-slate-300"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Status Pembayaran</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('Lunas')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      paymentStatus === 'Lunas'
                        ? 'bg-sky-500 border-sky-500 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-450'
                    }`}
                  >
                    Lunas
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('Hutang')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      paymentStatus === 'Hutang'
                        ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-450'
                    }`}
                  >
                    Kredit (Hutang)
                  </button>
                </div>
              </div>
            </div>

            {/* Condition due date picker */}
            {paymentStatus === 'Hutang' && (
              <div className="space-y-1.5 w-1/2">
                <label className="text-[10px] font-black text-rose-400 dark:text-rose-500 uppercase tracking-widest pl-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Jatuh Tempo Hutang
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full text-xs font-semibold bg-slate-55 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500 text-slate-700 dark:text-slate-300"
                />
              </div>
            )}

            {/* Items Cart list */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center pl-1">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Daftar Produk Pembelian</p>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> TAMBAH ITEM
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                  Keranjang pembelian kosong. Klik tombol 'TAMBAH ITEM' untuk memulai.
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-55 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      
                      {/* Product select dropdown */}
                      <div className="flex-1 min-w-[150px]">
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItem(index, 'productId', Number(e.target.value))}
                          className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-800 dark:text-slate-250"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>
                      </div>

                      {/* Qty input */}
                      <div className="w-20">
                        <input
                          type="number"
                          value={item.qty || ''}
                          onChange={(e) => handleUpdateItem(index, 'qty', Math.max(1, Number(e.target.value)))}
                          placeholder="Qty"
                          required
                          className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none text-center text-slate-800 dark:text-white"
                        />
                      </div>

                      {/* Cost price input */}
                      <div className="w-28">
                        <input
                          type="number"
                          value={item.costPrice || ''}
                          onChange={(e) => handleUpdateItem(index, 'costPrice', Math.max(0, Number(e.target.value)))}
                          placeholder="Harga Beli"
                          required
                          className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-800 dark:text-white"
                        />
                      </div>

                      {/* Subtotal view */}
                      <div className="w-28 text-right font-extrabold text-xs text-slate-700 dark:text-slate-350">
                        {formatCurrency(item.qty * item.costPrice)}
                      </div>

                      {/* Trash action */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total calculation panel */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs font-extrabold text-slate-400">Total Belanja Faktur:</span>
                <span className="block text-lg font-black text-sky-600 dark:text-sky-400">{formatCurrency(calculateTotal())}</span>
              </div>
              <button
                type="submit"
                disabled={cartItems.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-2xl text-xs font-extrabold shadow-lg disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-all"
              >
                PROSES SIMPAN FAKTUR
              </button>
            </div>

          </form>
        </div>

        {/* Purchase Logs (Right) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-max space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Faktur Terbaru</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Log transaksi pembelian stok</p>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {purchases.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Belum ada transaksi pembelian tercatat.
              </div>
            ) : (
              purchases.map((p) => (
                <div key={p.id} className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex justify-between items-center text-xs hover:border-slate-350 dark:hover:border-slate-700 transition-colors">
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-slate-400" /> Faktur #{p.id}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1"><Truck className="h-3 w-3" /> {p.supplier?.name || 'Supplier'}</p>
                    <p className="text-[9px] text-slate-400">{new Date(p.purchase_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="text-right space-y-1.5">
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
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Purchases;
