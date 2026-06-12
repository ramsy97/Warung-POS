import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  UserPlus, 
  DollarSign, 
  QrCode, 
  CreditCard, 
  Wallet, 
  Tag, 
  Plus, 
  Minus,
  CheckCircle,
  Printer,
  Calendar,
  Layers
} from 'lucide-react';
import api from '../api';

interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  sell_price: number;
  cost_price: number;
  stock: number;
  unit: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  name: string;
  points: number;
}

interface CartItem {
  product: Product;
  qty: number;
  sell_price: number;
}

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<number>(1); // 1 = Pelanggan Umum
  const [paymentMethod, setPaymentMethod] = useState<string>('Tunai');
  const [paymentStatus, setPaymentStatus] = useState<string>('Lunas');
  const [dueDate, setDueDate] = useState<string>('');
  
  // Checkout result modal
  const [successModal, setSuccessModal] = useState(false);
  const [createdSale, setCreatedSale] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search input reference for focusing
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [prodRes, catRes, custRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/categories'),
        api.get('/api/customers'),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error('Failed to load POS data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products by category & search query
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === null || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(searchQuery));
    return matchesCategory && matchesSearch && p.stock > 0;
  });

  // Automatically add product if search query matches exact barcode
  useEffect(() => {
    if (searchQuery.trim().length >= 6) {
      const match = products.find(p => p.barcode === searchQuery.trim() && p.stock > 0);
      if (match) {
        addToCart(match);
        setSearchQuery(''); // clear query
      }
    }
  }, [searchQuery, products]);

  const addToCart = (product: Product) => {
    setErrorMsg('');
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) {
        setErrorMsg(`Stok tidak mencukupi untuk ${product.name}`);
        return;
      }
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, qty: 1, sell_price: product.sell_price }]);
    }
  };

  const updateQty = (productId: number, val: number) => {
    setErrorMsg('');
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    const newQty = item.qty + val;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.product.id !== productId));
      return;
    }

    if (newQty > item.product.stock) {
      setErrorMsg(`Stok maksimal untuk ${item.product.name} adalah ${item.product.stock}`);
      return;
    }

    setCart(cart.map(i => i.product.id === productId ? { ...i, qty: newQty } : i));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.qty * item.sell_price, 0);
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - discount);
  };

  const handleCheckout = async () => {
    setErrorMsg('');
    if (cart.length === 0) {
      setErrorMsg('Keranjang belanja masih kosong');
      return;
    }

    if (paymentStatus === 'Piutang') {
      if (selectedCustomer === 1) {
        setErrorMsg('Silakan pilih pelanggan terdaftar untuk penjualan Piutang/Kredit');
        return;
      }
      if (!dueDate) {
        setErrorMsg('Silakan tentukan tanggal jatuh tempo pembayaran piutang');
        return;
      }
    }

    const payload = {
      customer_id: selectedCustomer === 1 ? null : selectedCustomer,
      items: cart.map(i => ({
        product_id: i.product.id,
        qty: i.qty,
        sell_price: i.sell_price
      })),
      discount,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      due_date: paymentStatus === 'Piutang' ? new Date(dueDate).toISOString() : null
    };

    try {
      const res = await api.post('/api/sales', payload);
      setCreatedSale(res.data);
      setSuccessModal(true);
      
      // Reset POS form
      setCart([]);
      setDiscount(0);
      setPaymentMethod('Tunai');
      setPaymentStatus('Lunas');
      setDueDate('');
      setSelectedCustomer(1);
      
      // Refresh stocks
      fetchData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal memproses checkout.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrintReceipt = () => {
    if (!createdSale) return;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/sales/${createdSale.id}/pdf`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950 select-none">
      
      {/* Products list panel (Left) */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden border-r border-slate-200 dark:border-slate-800">
        
        {/* Search & Category Filter */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk, SKU, atau scan barcode..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 focus:outline-none text-slate-800 dark:text-white font-semibold text-sm shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Categories Horizontal scrolling */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <Layers className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              <span className="text-sm font-semibold">Produk tidak ditemukan atau habis</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-sky-500 dark:hover:border-sky-500 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">{p.sku}</span>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 min-h-[32px] group-hover:text-sky-500 transition-colors">
                      {p.name}
                    </h4>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-end">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-semibold text-slate-400">Harga</p>
                      <p className="font-extrabold text-xs text-slate-800 dark:text-white">{formatCurrency(p.sell_price)}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      Stok: {p.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Cart Checkout panel (Right) */}
      <div className="w-full md:w-96 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col h-[60vh] md:h-full shrink-0 shadow-lg">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-sky-500" />
            <h3 className="font-black text-sm text-slate-800 dark:text-white">Keranjang POS</h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400">
            {cart.reduce((sum, item) => sum + item.qty, 0)} Pcs
          </span>
        </div>

        {/* Error notifications */}
        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold px-4 py-2 border-b border-rose-100 dark:border-rose-950/50">
            {errorMsg}
          </div>
        )}

        {/* Cart Item list */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800/80">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <ShoppingCart className="h-8 w-8 text-slate-300 dark:text-slate-700" />
              <span className="text-xs font-semibold">Keranjang kosong. Pilih produk.</span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-3.5 flex items-center justify-between group">
                <div className="flex-1 pr-3">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate w-48">{item.product.name}</h5>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{formatCurrency(item.sell_price)} / {item.product.unit}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => updateQty(item.product.id, -1)}
                    className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-black text-slate-800 dark:text-white min-w-[20px] text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.product.id, 1)}
                    className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg opacity-60 hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Forms & Configuration */}
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-4">
          
          {/* Customer Selection */}
          <div className="flex items-center gap-3">
            <UserPlus className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(Number(e.target.value))}
              className="flex-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 text-slate-700 dark:text-slate-300"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.id !== 1 ? `(${c.points} Poin)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Discount Field */}
          <div className="flex items-center gap-3">
            <Tag className="h-4 w-4 text-slate-400 shrink-0" />
            <div className="relative flex-1">
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="Potongan diskon (Rp)"
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-sky-500 text-slate-700 dark:text-slate-300"
              />
              <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-400">Rp</span>
            </div>
          </div>

          {/* Payment Status (Lunas / Piutang) */}
          <div className="flex gap-2">
            <button
              onClick={() => { setPaymentStatus('Lunas'); setPaymentMethod('Tunai'); }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                paymentStatus === 'Lunas'
                  ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
              }`}
            >
              LUNAS
            </button>
            <button
              onClick={() => { setPaymentStatus('Piutang'); setPaymentMethod('Transfer'); }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                paymentStatus === 'Piutang'
                  ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
              }`}
            >
              PIUTANG / KREDIT
            </button>
          </div>

          {/* Conditional configurations */}
          {paymentStatus === 'Lunas' ? (
            /* Payment Method Choice */
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { name: 'Tunai', icon: DollarSign },
                { name: 'QRIS', icon: QrCode },
                { name: 'Transfer', icon: CreditCard },
                { name: 'E-Wallet', icon: Wallet }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.name}
                    onClick={() => setPaymentMethod(method.name)}
                    className={`py-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === method.name
                        ? 'border-sky-500 bg-sky-50/30 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 font-extrabold'
                        : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-100/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] uppercase tracking-wider">{method.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Due Date Picker */
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-rose-400 shrink-0" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="flex-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 text-slate-700 dark:text-slate-300"
              />
            </div>
          )}

          {/* Pricing calculations */}
          <div className="pt-2 border-t border-slate-150 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>Subtotal</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-rose-500 font-semibold">
                <span>Potongan Diskon</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-1">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Total Tagihan</span>
              <span className="text-lg font-black text-sky-600 dark:text-sky-400">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          {/* Checkout Trigger */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-extrabold text-sm tracking-wider shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
          >
            BAYAR {formatCurrency(calculateTotal())}
          </button>
        </div>

      </div>

      {/* Checkout Success Dialogue Modal */}
      {successModal && createdSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-in scale-in duration-200">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7" />
            </div>
            
            <h3 className="text-lg font-black text-slate-800 dark:text-white">Transaksi Berhasil!</h3>
            <p className="text-xs text-slate-400 mt-1">Invoice ID: POS-{createdSale.id}</p>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-left space-y-2 border border-slate-100 dark:border-slate-800/60">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Total Belanja:</span>
                <span>{formatCurrency(createdSale.total_amount)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Diskon:</span>
                <span>-{formatCurrency(createdSale.discount)}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-800 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                <span>Total Akhir:</span>
                <span className="text-sky-600 dark:text-sky-400">{formatCurrency(createdSale.final_amount)}</span>
              </div>
              {createdSale.points_earned > 0 && (
                <div className="pt-2 text-[10px] text-center text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">
                  🎉 Pelanggan Mendapat +{createdSale.points_earned} Poin Reward!
                </div>
              )}
            </div>

            {/* QRIS Simulated dynamic QR payment */}
            {createdSale.payment_method === 'QRIS' && createdSale.payment_status === 'Lunas' && (
              <div className="mb-6 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pindai Kode QRIS</p>
                <div className="h-36 w-36 bg-white border border-slate-300 p-2 rounded-xl flex items-center justify-center shadow-inner relative">
                  <QrCode className="h-32 w-32 text-slate-800" />
                  <div className="absolute h-6 w-6 bg-sky-500 rounded-lg flex items-center justify-center text-white text-[8px] font-extrabold">POS</div>
                </div>
                <p className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full mt-1">
                  Dynamic QRIS Generated
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="h-4 w-4" />
                CETAK STRUK (PDF)
              </button>
              <button
                onClick={() => setSuccessModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-850 dark:hover:bg-slate-100 text-xs font-extrabold transition-all"
              >
                TRANSAKSI BARU
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default POS;
