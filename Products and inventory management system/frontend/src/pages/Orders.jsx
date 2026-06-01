import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Plus, ShoppingCart, Eye, Calendar, User } from 'lucide-react';
import OrderModal from '../components/OrderModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import DataTable from '../components/DataTable';

const ITEMS_PER_PAGE = 10;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const url = `/orders/?limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      const response = await api.get(url);
      setOrders(response.data.data || response.data);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openAddModal = () => {
    setIsModalOpen(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const columns = [
    {
      header: 'Order Reference',
      accessor: (row) => (
        <span className="font-mono text-[11px] text-zinc-400 bg-zinc-850 px-2 py-1 border border-zinc-800 rounded">
          {row.id.split('-')[0]}...
        </span>
      ),
    },
    {
      header: 'Customer Details',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/40 border border-zinc-700/30 flex items-center justify-center text-zinc-400">
            <User className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <p className="font-medium text-zinc-100 text-sm leading-none mb-1">{row.customer.full_name}</p>
            <p className="text-xs text-zinc-500 leading-none">{row.customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Date Created',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-zinc-300 font-medium">
          <Calendar className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
          <span>{formatDate(row.created_at)}</span>
        </div>
      ),
    },
    {
      header: 'Total Paid',
      accessor: (row) => (
        <span className="font-bold font-mono text-sm text-violet-400">
          {formatCurrency(row.total_amount)}
        </span>
      ),
    },
    {
      header: 'Fulfillment',
      accessor: () => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
          Completed
        </span>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex justify-end">
          <button
            onClick={() => openDetailsModal(row)}
            className="p-1.5 px-3 text-zinc-400 hover:text-violet-400 hover:bg-violet-500/5 rounded-lg border border-zinc-800/80 hover:border-violet-500/25 transition flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400">Sales Channel</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Orders Ledger</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Track and view completed invoice transactions, fulfillment status, and customer payments</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold tracking-wide px-4 py-2.5 rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Create Order</span>
        </button>
      </div>

      {/* Grid Container Card */}
      <div className="bg-[#12111a] rounded-2xl border border-zinc-800/60 overflow-hidden flex-1 flex flex-col shadow-2xl shadow-black/10">
        
        {/* Card Header Info */}
        <div className="p-4 border-b border-zinc-800/60 bg-zinc-800/10 flex justify-between items-center gap-4">
          <div className="font-semibold text-zinc-200 flex items-center text-sm gap-2">
            <ShoppingCart className="w-4 h-4 text-violet-400 stroke-[1.5]" />
            Recent Sales Transactions
          </div>
          
          <div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/30 px-3 py-1.5 rounded-lg border border-zinc-800/40">
            Total Sales: <span className="font-semibold text-violet-400">{total}</span> invoices
          </div>
        </div>

        {/* Reusable Data Table */}
        <div className="flex-1 flex flex-col">
          <DataTable 
            columns={columns}
            data={orders}
            loading={loading}
            emptyIcon={<ShoppingCart />}
            emptyMessage="No completed orders found."
            emptySubMessage="Place your first catalog sale by clicking 'Create Order' above."
          />
        </div>

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800/60 bg-zinc-800/10 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 font-mono">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, total)} of {total} sales
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

      <OrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchOrders}
      />

      <OrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default Orders;
