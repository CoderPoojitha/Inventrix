import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, Package, X } from 'lucide-react';
import ProductModal from '../components/ProductModal';
import DataTable from '../components/DataTable';

const ITEMS_PER_PAGE = 10;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [focused, setFocused] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      let url = `/products/?limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await api.get(url);
      setProducts(response.data.data || response.data);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // Reset to first page on new search
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete product.");
    }
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const columns = [
    {
      header: 'Product Name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/40 border border-zinc-700/30 flex items-center justify-center text-zinc-400">
            <Package className="w-4 h-4 stroke-[1.5]" />
          </div>
          <span className="font-medium text-zinc-100">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'SKU Code',
      accessor: (row) => (
        <span className="font-mono text-xs text-zinc-400 bg-zinc-850 px-2 py-1 border border-zinc-800 rounded">
          {row.sku}
        </span>
      ),
    },
    {
      header: 'Unit Price',
      accessor: (row) => (
        <span className="font-medium text-zinc-200">
          {formatCurrency(row.price)}
        </span>
      ),
    },
    {
      header: 'Stock Status',
      accessor: (row) => {
        const isLow = row.quantity_in_stock <= 10;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${
            isLow 
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
          }`}>
            {row.quantity_in_stock} in stock
          </span>
        );
      },
    },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-zinc-500 hover:text-violet-400 hover:bg-violet-500/5 rounded-lg border border-transparent hover:border-violet-500/10 transition cursor-pointer"
            title="Edit SKU"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg border border-transparent hover:border-rose-500/10 transition cursor-pointer"
            title="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400">Stock Room</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Products Catalog</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage and track your active inventory items, pricing levels, and SKUs</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold tracking-wide px-4 py-2.5 rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Add SKU</span>
        </button>
      </div>

      {/* Grid Container Card */}
      <div className="bg-[#12111a] rounded-2xl border border-zinc-800/60 overflow-hidden flex-1 flex flex-col shadow-2xl shadow-black/10">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800/60 bg-zinc-800/10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md flex items-stretch gap-2">
            <div className="relative flex-1">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${focused ? 'text-violet-400' : 'text-zinc-500'}`}>
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full pl-10 pr-10 py-2 bg-zinc-900/50 border border-zinc-800/80 focus:border-violet-500/50 focus:ring-violet-500/10 rounded-xl text-zinc-100 text-sm outline-none focus:ring-4 focus:bg-zinc-900/80 transition-all placeholder-zinc-500"
                placeholder="Search by product name or SKU code..."
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 w-5 h-5 flex items-center justify-center rounded-md hover:bg-zinc-800/50 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <button 
              type="submit" 
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl text-zinc-300 text-xs font-semibold tracking-wide hover:text-white transition cursor-pointer"
            >
              Search
            </button>
          </form>
          
          <div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/30 px-3 py-1.5 rounded-lg border border-zinc-800/40 shrink-0 self-start sm:self-center">
            Total Inventory: <span className="font-semibold text-violet-400">{total}</span> SKUs
          </div>
        </div>

        {/* Reusable Data Table */}
        <div className="flex-1 flex flex-col">
          <DataTable 
            columns={columns}
            data={products}
            loading={loading}
            emptyIcon={<Package />}
            emptyMessage="No products registered yet."
            emptySubMessage="Try adjusting your search criteria or register a new product SKU above."
          />
        </div>

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800/60 bg-zinc-800/10 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, total)} of {total} SKUs
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-zinc-850 hover:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-zinc-850 hover:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={fetchProducts}
      />
    </div>
  );
};

export default Products;
