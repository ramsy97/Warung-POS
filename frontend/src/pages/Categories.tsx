import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, X } from 'lucide-react';
import api from '../api';

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  
  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setActiveCategory(null);
    setName('');
    setDescription('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setActiveCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (activeCategory) {
        await api.put(`/api/categories/${activeCategory.id}`, { name, description });
      } else {
        await api.post('/api/categories', { name, description });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal menyimpan kategori.');
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"?`)) {
      try {
        await api.delete(`/api/categories/${id}`);
        fetchCategories();
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.detail || 'Gagal menghapus kategori.');
      }
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-200">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-wide">Kategori Produk</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Klasifikasi Inventaris Barang</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" /> TAMBAH KATEGORI
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-55 dark:bg-slate-850/40 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="py-4 px-6">ID</th>
              <th className="py-4 px-6">NAMA KATEGORI</th>
              <th className="py-4 px-6">DESKRIPSI</th>
              <th className="py-4 px-6 text-center">TINDAKAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold">
                  Belum ada kategori yang ditambahkan.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-55/40 dark:hover:bg-slate-850/20 transition-colors">
                  <td className="py-4.5 px-6 font-bold text-slate-400">#{c.id}</td>
                  <td className="py-4.5 px-6 font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-sky-400 shrink-0" />
                    {c.name}
                  </td>
                  <td className="py-4.5 px-6 text-slate-500 dark:text-slate-450 font-semibold">{c.description || '-'}</td>
                  <td className="py-4.5 px-6 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-2 text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Edit Kategori"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-2 text-slate-450 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Hapus Kategori"
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-800 overflow-hidden animate-in scale-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-55/50 dark:bg-slate-900/40">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">
                {activeCategory ? 'EDIT KATEGORI' : 'TAMBAH KATEGORI BARU'}
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
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nama Kategori</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: Makanan Instan"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat kategori..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white h-24 resize-none"
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
                  SIMPAN KATEGORI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
