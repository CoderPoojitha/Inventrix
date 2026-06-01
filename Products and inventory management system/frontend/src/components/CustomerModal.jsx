import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { X, User, Mail, Phone, AlertCircle } from 'lucide-react';

const CustomerModal = ({ isOpen, onClose, customer, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  
  // Track input focuses for premium icon glow
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        reset({
          full_name: customer.full_name,
          email: customer.email,
          phone_number: customer.phone_number || '',
        });
      } else {
        reset({
          full_name: '',
          email: '',
          phone_number: '',
        });
      }
    }
  }, [isOpen, customer, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    const payload = { ...data };
    if (!payload.phone_number) {
      delete payload.phone_number;
    }

    try {
      if (customer) {
        await api.put(`/customers/${customer.id}`, payload);
      } else {
        await api.post('/customers/', payload);
      }
      onSave(); // Refresh the list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Failed to save customer", error);
      alert(error.response?.data?.message || error.response?.data?.detail || "Failed to save customer.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0b0f]/75 backdrop-blur-md select-none">
      <div className="bg-[#12111a] border border-zinc-800/80 rounded-2xl w-full max-w-md shadow-2xl shadow-black/80 overflow-hidden transition-all duration-300">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800/60 bg-zinc-800/10 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
              {customer ? 'Edit Client Account' : 'Register New Client'}
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {customer ? 'Modify profile tags and contact channels' : 'Configure contact connections and directory metadata'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1.5 flex items-center gap-1.5">
              <User className={`w-3.5 h-3.5 transition-colors duration-150 ${focusedField === 'full_name' ? 'text-violet-400' : 'text-zinc-500'}`} />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              {...register("full_name", { required: "Full name is required" })}
              onFocus={() => setFocusedField('full_name')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-2.5 bg-zinc-900/50 border ${errors.full_name ? 'border-red-500/40 focus:ring-red-500/10' : 'border-zinc-800/80 focus:border-violet-500/50 focus:ring-violet-500/10'} rounded-xl text-zinc-100 text-sm outline-none focus:ring-4 focus:bg-zinc-900 transition-all placeholder-zinc-650`}
              placeholder="e.g. Jane Doe"
            />
            {errors.full_name && (
              <p className="text-red-400 text-[10px] font-medium flex items-center gap-1 mt-1.5 pl-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1.5 flex items-center gap-1.5">
              <Mail className={`w-3.5 h-3.5 transition-colors duration-150 ${focusedField === 'email' ? 'text-violet-400' : 'text-zinc-500'}`} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" }
              })}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-2.5 bg-zinc-900/50 border ${errors.email ? 'border-red-500/40 focus:ring-red-500/10' : 'border-zinc-800/80 focus:border-violet-500/50 focus:ring-violet-500/10'} rounded-xl text-zinc-100 text-sm outline-none focus:ring-4 focus:bg-zinc-900 transition-all placeholder-zinc-650`}
              placeholder="e.g. jane@example.com"
            />
            {errors.email && (
              <p className="text-red-400 text-[10px] font-medium flex items-center gap-1 mt-1.5 pl-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Connection */}
          <div>
            <label className="block text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-1.5 flex items-center gap-1.5">
              <Phone className={`w-3.5 h-3.5 transition-colors duration-150 ${focusedField === 'phone_number' ? 'text-violet-400' : 'text-zinc-500'}`} />
              <span>Phone Link (Optional)</span>
            </label>
            <input
              type="text"
              {...register("phone_number")}
              onFocus={() => setFocusedField('phone_number')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800/80 focus:border-violet-500/50 focus:ring-violet-500/10 rounded-xl text-zinc-100 text-sm outline-none focus:ring-4 focus:bg-zinc-900 transition-all placeholder-zinc-650`}
              placeholder="e.g. +1 555-0100"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex justify-end gap-3 mt-8">
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
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold tracking-wide rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-w-[140px]"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Save Customer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
