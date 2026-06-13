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
    ? Math.min(Math.round((deliveredOrders / totalOrders) * 100), 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" id="kpi-cards-grid" dir="rtl">
      {/* 1. إجمالي المبيعات (Revenue) */}
      <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">إجمالي المبيعات</p>
          <div className="text-green-600 bg-green-50 p-2 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
          {totalRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-400 mr-1">DA</span>
        </h2>
        <div className="w-full mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="bg-green-500 h-full w-full rounded-full" />
        </div>
      </div>

      {/* 2. إجمالي الطلبات (Total Orders) */}
      <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">إجمالي الطلبات</p>
          <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
          {totalOrders.toLocaleString()}
        </h2>
        <div className="w-full mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full w-full rounded-full" />
        </div>
      </div>

      {/* 3. القطع المباعة (Total Items Sold) */}
      <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">القطع المباعة</p>
          <div className="text-amber-600 bg-amber-50 p-2 rounded-lg">
            <ShoppingBasket className="w-4 h-4" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
          {totalItems.toLocaleString()}
        </h2>
        <div className="w-full mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="bg-amber-500 h-full w-full rounded-full" />
        </div>
      </div>

      {/* 4. معدل التسليم (Delivery Rate) */}
      <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">معدل التسليم</p>
          <div className="text-purple-600 bg-purple-50 p-2 rounded-lg">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-0.5">
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
              {literalDeliveryRate}
            </h2>
            <span className="text-sm text-slate-400">%</span>
          </div>
          
          {/* Delivery Rate progress bar */}
          <div className="w-full mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-[#2563EB] h-full transition-all duration-500 rounded-full" 
              style={{ width: `${Math.min(literalDeliveryRate, 100)}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
