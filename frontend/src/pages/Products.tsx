import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Barcode, 
  Search, 
  X,
  AlertTriangle
} from 'lucide-react';
import api from '../api';

interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  category_id: number;
  cost_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  supplier_id?: number;
  category?: { id: number; name: string };
  supplier?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  
  // Form Fields
  const [sku, setSku] = useState('');
  const [barcodeVal, setBarcodeVal] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(5);
  const [unit, setUnit] = useState('Pcs');
  const [supplierId, setSupplierId] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInitialData = async () => {
    try {
      const [prodRes, catRes, supRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/categories'),
        api.get('/api/suppliers'),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOpenCreate = () => {
    setActiveProduct(null);
    setSku(`PRD${Math.floor(1000 + Math.random() * 9000)}`);
    setBarcodeVal('');
    setName('');
    setCategoryId(categories[0]?.id?.toString() || '');
    setCostPrice(0);
    setSellPrice(0);
    setStock(0);
    setMinStock(5);
    setUnit('Pcs');
    setSupplierId(suppliers[0]?.id?.toString() || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setActiveProduct(p);
    setSku(p.sku);
    setBarcodeVal(p.barcode || '');
    setName(p.name);
    setCategoryId(p.category_id.toString());
    setCostPrice(p.cost_price);
    setSellPrice(p.sell_price);
    setStock(p.stock);
    setMinStock(p.min_stock);
    setUnit(p.unit);
    setSupplierId(p.supplier_id?.toString() || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenBarcode = (p: Product) => {
    setActiveProduct(p);
    setBarcodeModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (sellPrice < costPrice) {
      setErrorMsg('Harga jual tidak boleh lebih kecil dari harga beli');
      return;
    }

    const payload = {
      sku,
      barcode: barcodeVal || null,
      name,
      category_id: Number(categoryId),
      cost_price: Number(costPrice),
      sell_price: Number(sellPrice),
      stock: Number(stock),
      min_stock: Number(minStock),
      unit,
      supplier_id: supplierId ? Number(supplierId) : null
    };

    try {
      if (activeProduct) {
        // Edit Mode
        await api.put(`/api/products/${activeProduct.id}`, payload);
      } else {
        // Create Mode
        await api.post('/api/products', payload);
      }
      setModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal menyimpan produk.');
    }
  };

  const handleDelete = async (id: number, prodName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${prodName}"?`)) {
      try {
        await api.delete(`/api/products/${id}`);
        fetchInitialData();
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.detail || 'Gagal menghapus produk.');
      }
    }
  };

  const handleExportExcel = () => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/products/export/excel`;
    window.open(url, '_blank');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter local product list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(search));
    const matchesCategory = !selectedCategory || p.category_id === Number(selectedCategory);
    const matchesLowStock = !lowStockFilter || p.stock <= p.min_stock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Master Produk</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola Seluruh Inventaris Barang</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-extrabold text-slate-700 dark:text-slate-350 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="h-4 w-4" /> EXPORT EXCEL
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" /> TAMBAH PRODUK
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, SKU, atau barcode produk..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500/20 focus:outline-none text-xs font-semibold text-slate-800 dark:text-white"
          />
        </div>
        
        {/* Category Choice */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 focus:outline-none text-slate-700 dark:text-slate-300"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Low stock checkbox filter */}
        <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-700 text-sky-500 focus:ring-sky-500/20"
          />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Stok Kritis</span>
        </label>
      </div>

      {/* Products Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-6">SKU / BARCODE</th>
                <th className="py-4 px-6">NAMA PRODUK</th>
                <th className="py-4 px-6">KATEGORI</th>
                <th className="py-4 px-6">HARGA BELI</th>
                <th className="py-4 px-6">HARGA JUAL</th>
                <th className="py-4 px-6">STOK</th>
                <th className="py-4 px-6 text-center">TINDAKAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    Tidak ada produk yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock <= p.min_stock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-4.5 px-6 font-bold">
                        <span className="text-slate-800 dark:text-slate-200 block">{p.sku}</span>
                        <span className="text-[10px] text-slate-400 tracking-wider font-semibold block">{p.barcode || '-'}</span>
                      </td>
                      <td className="py-4.5 px-6 font-bold text-slate-850 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="py-4.5 px-6 text-slate-500 dark:text-slate-400 font-semibold">
                        {p.category?.name || '-'}
                      </td>
                      <td className="py-4.5 px-6 font-semibold text-slate-600 dark:text-slate-400">
                        {formatCurrency(p.cost_price)}
                      </td>
                      <td className="py-4.5 px-6 font-extrabold text-slate-800 dark:text-white">
                        {formatCurrency(p.sell_price)}
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`px-2.5 py-1 rounded-xl font-extrabold inline-flex items-center gap-1.5 ${
                          isLow 
                            ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' 
                            : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {p.stock} {p.unit}
                          {isLow && <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenBarcode(p)}
                            className="p-2 text-slate-500 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Tampilkan Barcode Label"
                          >
                            <Barcode className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit Produk"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Hapus Produk"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* CRUD Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-800 overflow-hidden animate-in scale-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">
                {activeProduct ? 'EDIT PRODUK' : 'TAMBAH PRODUK BARU'}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">SKU Barang</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nomor Barcode</label>
                  <input
                    type="text"
                    value={barcodeVal}
                    onChange={(e) => setBarcodeVal(e.target.value)}
                    placeholder="Masukkan barcode EAN"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nama Produk</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: Indomie Goreng Spesial"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-750 dark:text-slate-300"
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Supplier Utama</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-750 dark:text-slate-300"
                  >
                    <option value="">Tidak Ada Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    required
                    placeholder="Harga Modal"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={sellPrice || ''}
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    required
                    placeholder="Harga Retail"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Stok Awal</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Min. Stok Warning</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Satuan</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    placeholder="Pcs, Kg, Sachet"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
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
                  SIMPAN PERUBAHAN
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Barcode Label Print Modal */}
      {barcodeModalOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-150 dark:border-slate-800 text-center animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-extrabold text-xs text-slate-800 dark:text-white">LABEL BARCODE PRODUK</span>
              <button onClick={() => setBarcodeModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* The Barcode Card design */}
            <div className="p-6 bg-white border border-slate-300 rounded-2xl flex flex-col items-center gap-1.5 shadow-inner">
              <span className="text-[10px] font-black text-slate-850 tracking-wider">WARUNGPOS RETAIL</span>
              <span className="text-xs font-extrabold text-slate-800 text-center w-64 truncate">{activeProduct.name}</span>
              
              {/* Simulated barcode graphic lines */}
              <div className="h-10 w-48 flex items-center justify-between border-y border-slate-100 py-1.5 my-2">
                {[1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1].map((w, idx) => (
                  <div 
                    key={idx} 
                    className="h-full bg-slate-800 rounded-sm"
                    style={{ width: `${w}px` }}
                  ></div>
                ))}
              </div>
              
              <span className="text-[10px] font-black tracking-widest text-slate-800">{activeProduct.barcode || activeProduct.sku}</span>
              <span className="text-xs font-black text-rose-600 mt-1">{formatCurrency(activeProduct.sell_price)}</span>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-normal">
              Label ini dapat dicetak langsung menggunakan printer label barcode termal (thermal label roll).
            </p>

            <button
              onClick={() => { window.print(); }}
              className="w-full mt-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-xs hover:bg-slate-850 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-1"
            >
              <Barcode className="h-4 w-4" /> CETAK LABEL
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
