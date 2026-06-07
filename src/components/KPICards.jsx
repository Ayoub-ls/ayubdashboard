import React from 'react';
import { DollarSign, ShoppingBasket, ShoppingBag, Truck } from 'lucide-react';

export default function KPICards({ orders = [], prices = [] }) {
  // Helper to get price for a specific source
  const getPrice = (source, pricesList) => {
    if (!source) return 0;
    const priceEntry = pricesList.find(
      (p) => p.source?.toLowerCase().trim() === source.toLowerCase().trim()
    );
    return priceEntry ? priceEntry.price : 0;
  };

  // 1. Active orders (all except cancelled)
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');

  // 2. Total active revenue (quantity * price)
  const totalRevenue = activeOrders.reduce((sum, order) => {
    const price = getPrice(order.source, prices);
    const qty = order.quantity || 1;
    return sum + (qty * price);
  }, 0);

  // 3. Total orders (all including cancelled for total count reference)
  const totalOrders = orders.length;

  // 4. Total pieces sold (sum of quantities from active orders)
  const totalItems = activeOrders.reduce((sum, order) => {
    return sum + (order.quantity || 1);
  }, 0);

  // 5. Delivery rate: delivered / totalOrders * 100
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 105 : 0; 
  // Wait, let's look at the instruction: deliveryRate = delivered / total * 100
  // Let's use the literal mathematical calculation: (delivered / total) * 100, capped at 100.
  const literalDeliveryRate = totalOrders > 0 
    ? Math.round((deliveredOrders / totalOrders) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" id="kpi-cards-grid" dir="rtl">
      {/* 1. إجمالي المبيعات (Revenue) - Emerald */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-xs font-semibold">إجمالي المبيعات</p>
          <div className="text-emerald-500 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-emerald-400 font-sans tracking-tight">
              {totalRevenue.toLocaleString()} <span className="text-xs font-normal opacity-70 mr-1 text-slate-400">DA</span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-1">المبيعات غير الملغاة</p>
          </div>
          <div className="text-emerald-500 text-xs font-mono font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
            +100%
          </div>
        </div>
      </div>

      {/* 2. إجمالي الطلبات (Total Orders) - Blue */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-xs font-semibold">إجمالي الطلبات</p>
          <div className="text-indigo-400 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-indigo-400 font-sans tracking-tight">
              {totalOrders.toLocaleString()}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1">كل الحالات الواردة</p>
          </div>
          <div className="text-indigo-400 text-xs font-mono bg-indigo-500/10 px-2 py-0.5 rounded-full">
            مستمر
          </div>
        </div>
      </div>

      {/* 3. القطع المباعة (Total Items Sold) - Amber */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-xs font-semibold">القطع المباعة</p>
          <div className="text-amber-500 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
            <ShoppingBasket className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-amber-400 font-sans tracking-tight">
              {totalItems.toLocaleString()}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1">مجموع كميات الطلبيات</p>
          </div>
          <div className="text-amber-500 text-xs font-mono bg-amber-500/10 px-2 py-0.5 rounded-full">
            نشط
          </div>
        </div>
      </div>

      {/* 4. معدل التسليم (Delivery Rate) - Indigo/Sky */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-sky-500/30 transition-all shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-xs font-semibold">معدل التسليم</p>
          <div className="text-sky-400 bg-sky-500/10 p-2 rounded-xl border border-sky-500/20">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="w-full">
            <div className="flex items-baseline gap-1">
              <h2 className="text-2xl font-bold text-sky-400 font-sans tracking-tight">
                {literalDeliveryRate}
              </h2>
              <span className="text-sm opacity-70 text-slate-400">%</span>
            </div>
            
            {/* Delivery Rate progress bar */}
            <div className="w-full mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="bg-sky-500 h-full transition-all duration-500 rounded-full" 
                style={{ width: `${Math.min(literalDeliveryRate, 100)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
