import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { X, Tag, Hash, DollarSign, Layers, AlertCircle } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [focused, setFocused] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity_in_stock: product.quantity_in_stock,
        });
      } else {
        reset({
          name: '',
          sku: '',
          price: 0,
          quantity_in_stock: 0,
        });
      }
    }
  }, [isOpen, product, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      if (product) {
        await api.put(`/products/${product.id}`, data);
      } else {
        await api.post('/products/', data);
      }
      onSave(); // Refresh the list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Failed to save product", error);
      alert(error.response?.data?.message || error.response?.data?.detail || "Failed to save product.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0b0f]/75 backdrop-blur-md select-none">
      <div className="bg-[#12111a] border border-zinc-800/80 rounded-2xl w-full max-w-md shadow-2xl shadow-black/70 overflow-hidden transition-all duration-300">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800/60 bg-zinc-800/10">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
              {product ? 'Edit Product SKU' : 'Add New Product'}
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {product ? 'Modify details for this catalog item' : 'Register a new item in your inventory'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* Product Name */}
          <div>
            <label className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1.5">
              Product Name
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${focused === 'name' ? 'text-violet-400' : 'text-zinc-500'}`}>
                <Tag className="w-[15px] h-[15px]" />
              </span>
              <input
                type="text"
                {...register("name", { required: "Product name is required" })}
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border ${errors.name ? 'border-red-500/40 focus:ring-red-500/10' : 'border-zinc-800/80 focus:border-violet-500/50 focus:ring-violet-500/10'} rounded-xl text-zinc-100 text-sm outline-none focus:ring-4 focus:bg-zinc-900 transition-all`}
                placeholder="e.g. Wireless Mouse"
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
              />
            </div>
            {errors.name && (
              <p className="text-red-400 text-[11px] font-medium flex items-center gap-1.5 mt-1.5 pl-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1.5">
              SKU Identifier
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${focused === 'sku' ? 'text-violet-400' : 'text-zinc-500'}`}>
                <Hash className="w-[15px] h-[15px]" />
              </span>
              <input
                type="text"
                {...register("sku", { required: "SKU identifier is required" })}
                className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border ${errors.sku ? 'border-red-500/40 focus:ring-red-500/10' : 'border-zinc-800/80 focus:border-violet-500/50 focus:ring-violet-500/10'} rounded-xl text-zinc-100 text-sm outline-none focus:ring-4 focus:bg-zinc-900 transition-all`}
                placeholder="e.g. MS-WIRE-01"
                onFocus={() => setFocused('sku')}
                onBlur={() => setFocused('')}
              />
            </div>
            {errors.sku && (
              <p className="text-red-400 text-[11px] font-medium flex items-center gap-1.5 mt-1.5 pl-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.sku.message}
              </p>
            )}
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Price */}
            <div>
              <label className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1.5">
                Unit Price
              </label>
              <div className="relative">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${focused === 'price' ? 'text-violet-400' : 'text-zinc-500'}`}>
                  <DollarSign className="w-[15px] h-[15px]" />
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { 
                    required: "Price is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Price cannot be negative" }
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border ${errors.price ? 'border-red-500/40 focus:ring-red-500/10' : 'border-zinc-800/80 focus:border-violet-500/50 focus:ring-violet-500/10'} rounded-xl text-zinc-100 text-sm outline-none focus:ring-4 focus:bg-zinc-900 transition-all`}
                  onFocus={() => setFocused('price')}
                  onBlur={() => setFocused('')}
                />
              </div>
              {errors.price && (
                <p className="text-red-400 text-[11px] font-medium flex items-center gap-1.5 mt-1.5 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1.5">
                Quantity in Stock
              </label>
              <div className="relative">
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150 ${focused === 'qty' ? 'text-violet-400' : 'text-zinc-500'}`}>
                  <Layers className="w-[15px] h-[15px]" />
                </span>
                <input
                  type="number"
                  min="0"
                  {...register("quantity_in_stock", { 
                    required: "Quantity is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Quantity cannot be negative" }
                  })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border ${errors.quantity_in_stock ? 'border-red-500/40 focus:ring-red-500/10' : 'border-zinc-800/80 focus:border-violet-500/50 focus:ring-violet-500/10'} rounded-xl text-zinc-100 text-sm outline-none focus:ring-4 focus:bg-zinc-900 transition-all`}
                  onFocus={() => setFocused('qty')}
                  onBlur={() => setFocused('')}
                />
              </div>
              {errors.quantity_in_stock && (
                <p className="text-red-400 text-[11px] font-medium flex items-center gap-1.5 mt-1.5 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.quantity_in_stock.message}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 mt-8 pt-4 border-t border-zinc-800/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 text-xs font-semibold tracking-wide transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold tracking-wide rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-w-[120px]"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span>Save SKU</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
