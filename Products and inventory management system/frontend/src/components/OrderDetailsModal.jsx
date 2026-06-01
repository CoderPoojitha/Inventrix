import React from 'react';
import { X, Package, Calendar, User, CreditCard, Info } from 'lucide-react';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0b0f]/75 backdrop-blur-md select-none">
      <div className="bg-[#12111a] border border-zinc-800/80 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/80 overflow-hidden max-h-[90vh] flex flex-col transition-all duration-300">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800/60 bg-zinc-800/10 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 tracking-tight">Order Invoice Summary</h2>
            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
              <span>Receipt Ref:</span>
              <span className="font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-xs text-violet-400 font-semibold shadow-sm">{order.id}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Details Block */}
            <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/60 hover:border-zinc-700/30 transition">
              <div className="flex items-center text-violet-400 mb-3 gap-2">
                <User className="w-4 h-4 stroke-[1.75]" />
                <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Customer Details</span>
              </div>
              <p className="font-medium text-zinc-100 text-lg leading-tight mb-1">{order.customer.full_name}</p>
              <p className="text-xs text-zinc-500">{order.customer.email}</p>
              {order.customer.phone_number && <p className="text-xs text-zinc-500 mt-1">{order.customer.phone_number}</p>}
            </div>
            
            {/* Order Info Block */}
            <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/60 hover:border-zinc-700/30 transition">
              <div className="flex items-center text-violet-400 mb-3 gap-2">
                <Calendar className="w-4 h-4 stroke-[1.75]" />
                <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Order Metadata</span>
              </div>
              <p className="text-xs text-zinc-400 mb-2.5 flex items-center justify-between">
                <span className="text-zinc-500">Date Logged:</span> 
                <span className="font-medium font-mono text-zinc-300">{formatDate(order.created_at)}</span>
              </p>
              <p className="text-xs text-zinc-400 flex items-center justify-between">
                <span className="text-zinc-500">Fulfillment Status:</span> 
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono border bg-emerald-500/10 border-emerald-500/25 text-emerald-400 uppercase tracking-wider">Completed</span>
              </p>
            </div>
          </div>

          {/* Table list of Order Items */}
          <div>
            <div className="flex items-center text-zinc-200 mb-3.5 font-semibold text-sm gap-2">
              <Package className="w-4 h-4 text-violet-400 stroke-[1.5]" />
              <span>Purchase Breakdown</span>
              <span className="ml-1.5 bg-zinc-800 text-zinc-400 font-mono text-[10px] px-2 py-0.5 rounded-full border border-zinc-700/40">
                {order.items.length} items
              </span>
            </div>
            
            <div className="border border-zinc-800/60 rounded-xl overflow-hidden shadow-md">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="text-[10px] text-zinc-500 uppercase bg-zinc-800/20 border-b border-zinc-800/60">
                  <tr>
                    <th className="px-5 py-3 font-normal font-mono tracking-wider">Product Catalog</th>
                    <th className="px-5 py-3 font-normal font-mono tracking-wider text-right">Unit Price</th>
                    <th className="px-5 py-3 font-normal font-mono tracking-wider text-center">Quantity</th>
                    <th className="px-5 py-3 font-normal font-mono tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-150 text-xs">{item.product.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">{item.product.sku}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs text-zinc-400">{formatCurrency(item.unit_price)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="bg-zinc-800/60 border border-zinc-700/25 px-2 py-0.5 rounded font-mono text-xs text-zinc-300">{item.quantity}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs font-semibold text-zinc-200">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sticky Invoice Footer */}
        <div className="p-6 border-t border-zinc-800/60 bg-zinc-950/60 shrink-0 flex justify-between items-center">
          <div className="flex items-center text-zinc-500 text-[11px] gap-2">
            <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
            <span>Fulfillment Payment Accounted</span>
          </div>
          
          <div className="text-right flex items-center bg-zinc-900 border border-zinc-800/80 px-5 py-2.5 rounded-xl shadow-sm">
            <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mr-4">Total Paid</span>
            <span className="font-bold text-violet-400 text-2xl font-mono tracking-tight">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
