import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import api from '../api/axios';
import { X, Plus, Trash2, ShoppingCart, User, Layers, Info, DollarSign, AlertCircle } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, onSave }) => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const { register, control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      customer_id: "",
      items: [{ product_id: "", quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = useWatch({
    control,
    name: "items"
  });

  // Fetch customers and products
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setLoadingDeps(true);
          const [custRes, prodRes] = await Promise.all([
            api.get('/customers/?limit=100'), 
            api.get('/products/?limit=100')
          ]);
          setCustomers(custRes.data.data || custRes.data);
          setProducts(prodRes.data.data || prodRes.data);
        } catch (error) {
          console.error("Failed to load dependencies", error);
        } finally {
          setLoadingDeps(false);
        }
      };
      fetchData();
      
      reset({
        customer_id: "",
        items: [{ product_id: "", quantity: 1 }]
      });
    }
  }, [isOpen, reset]);

  // Live total calculation
  const totalAmount = useMemo(() => {
    if (!Array.isArray(watchItems)) return 0;
    let sum = 0;
    for (const item of watchItems) {
      if (!item || !item.product_id) continue;
      const product = products.find(p => String(p.id) === String(item.product_id));
      if (!product) continue;
      
      const price = Number(product.price);
      const qty = Number(item.quantity);
      
      if (!isNaN(price) && !isNaN(qty) && qty > 0) {
        sum += price * qty;
      }
    }
    return sum;
  }, [watchItems, products]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      await api.post('/orders/', data);
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to create order", error);
      alert(error.response?.data?.message || error.response?.data?.detail || "Failed to create order.");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0b0f]/75 backdrop-blur-md select-none">
      <div className="bg-[#12111a] border border-zinc-800/80 rounded-2xl w-full max-w-3xl shadow-2xl shadow-black/80 overflow-hidden max-h-[90vh] flex flex-col transition-all duration-300">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800/60 bg-zinc-800/10 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 tracking-tight">Create Sales Order</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Register a new client transaction and log invoice subtotals</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {loadingDeps ? (
          <div className="p-20 flex flex-col justify-center items-center gap-3">
            <svg className="animate-spin h-7 w-7 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs text-zinc-500 tracking-wider">Acquiring Catalog Data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Customer Selection */}
              <div>
                <label className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                  <span>Select Client</span>
                </label>
                <div className="relative">
                  <select
                    {...register("customer_id", { required: "Please select a customer" })}
                    className={`w-full px-4 py-2.5 bg-zinc-900/50 border ${errors.customer_id ? 'border-red-500/40 focus:ring-red-500/10' : 'border-zinc-800/80 focus:border-violet-500/50 focus:ring-violet-500/10'} rounded-xl text-zinc-100 text-sm outline-none focus:ring-4 focus:bg-zinc-900 transition-all`}
                  >
                    <option value="">-- Choose Account --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                    ))}
                  </select>
                </div>
                {errors.customer_id && (
                  <p className="text-red-400 text-[11px] font-medium flex items-center gap-1.5 mt-1.5 pl-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.customer_id.message}
                  </p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                    <span>Purchase Items</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ product_id: "", quantity: 1 })}
                    className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold tracking-wide hover:bg-violet-500/5 border border-zinc-800/80 hover:border-violet-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const selectedProductId = watchItems?.[index]?.product_id;
                    const selectedProduct = products.find(p => String(p.id) === String(selectedProductId));
                    
                    return (
                      <div key={field.id} className="flex flex-col md:flex-row items-stretch md:items-start gap-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700/40 transition-all">
                        
                        {/* Select Product */}
                        <div className="flex-1">
                          <select
                            {...register(`items.${index}.product_id`, { required: "Product is required" })}
                            className={`w-full px-3 py-2 bg-zinc-900/50 border ${errors?.items?.[index]?.product_id ? 'border-red-500/40' : 'border-zinc-800/80'} rounded-lg text-zinc-200 text-xs outline-none focus:border-violet-500/50 transition-all`}
                          >
                            <option value="">-- Select Catalog SKU --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                                {p.name} {p.quantity_in_stock === 0 ? '(Out of Stock)' : ''}
                              </option>
                            ))}
                          </select>
                          {errors?.items?.[index]?.product_id && (
                            <p className="text-red-400 text-[10px] mt-1 pl-0.5">{errors.items[index].product_id.message}</p>
                          )}
                          {selectedProduct && (
                            <p className="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1 pl-0.5">
                              <Info className="w-3 h-3 text-zinc-500" />
                              <span>Price: <strong className="text-zinc-400">{formatCurrency(selectedProduct.price)}</strong></span>
                              <span className="text-zinc-700 font-bold">•</span>
                              <span>In Stock: <strong className={selectedProduct.quantity_in_stock <= 3 ? 'text-rose-400' : 'text-emerald-400'}>{selectedProduct.quantity_in_stock}</strong></span>
                            </p>
                          )}
                        </div>
                        
                        {/* Quantity */}
                        <div className="w-full md:w-28 shrink-0">
                          <input
                            type="number"
                            min="1"
                            {...register(`items.${index}.quantity`, { 
                              required: "Required",
                              valueAsNumber: true,
                              min: { value: 1, message: "Min 1" },
                              validate: (value) => {
                                if (!selectedProduct) return true;
                                return value <= selectedProduct.quantity_in_stock || `Max ${selectedProduct.quantity_in_stock}`;
                              }
                            })}
                            className={`w-full px-3 py-2 bg-zinc-900/50 border ${errors?.items?.[index]?.quantity ? 'border-red-500/40' : 'border-zinc-800/80'} rounded-lg text-zinc-200 text-xs outline-none focus:border-violet-500/50 transition-all`}
                            placeholder="Qty"
                          />
                          {errors?.items?.[index]?.quantity && (
                            <p className="text-red-400 text-[10px] mt-1 pl-0.5">{errors.items[index].quantity.message}</p>
                          )}
                        </div>

                        {/* Item Total Sub-Amount */}
                        <div className="w-full md:w-28 shrink-0 flex items-center justify-between md:justify-end pt-2 text-xs font-mono text-zinc-400 font-medium">
                          <span className="md:hidden text-zinc-500">Subtotal:</span>
                          <span>
                            {selectedProduct && Number(watchItems?.[index]?.quantity) > 0
                              ? formatCurrency(Number(selectedProduct.price) * Number(watchItems?.[index]?.quantity))
                              : '$0.00'}
                          </span>
                        </div>

                        {/* Remove Row Button */}
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg border border-transparent hover:border-rose-500/10 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 self-end md:self-start cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Grand Total Footer */}
            <div className="p-6 border-t border-zinc-800/60 bg-zinc-950/60 shrink-0 flex justify-between items-center z-10">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Grand Total</span>
                </span>
                <div className="font-bold text-violet-400 text-3xl font-mono tracking-tight">{formatCurrency(totalAmount)}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 text-xs font-semibold tracking-wide transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || fields.length === 0}
                  className="px-8 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold tracking-wide rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-w-[150px]"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
