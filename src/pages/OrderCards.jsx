import { useState } from 'react';
import {
  Phone, Trash2, Search, RefreshCw, ShoppingCart
} from 'lucide-react';

const STATUS = {
  pending:   { label: "في الانتظار", bg: "bg-amber-50",  text: "text-amber-600",  dot: "bg-amber-400"  },
  confirmed: { label: "مؤكد",        bg: "bg-blue-50",   text: "text-blue-600",   dot: "bg-blue-400"   },
  called:    { label: "اتصل",        bg: "bg-cyan-50",   text: "text-cyan-600",   dot: "bg-cyan-400"   },
  shipped:   { label: "تم الشحن",    bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400" },
  delivered: { label: "تم التسليم",  bg: "bg-green-50",  text: "text-green-600",  dot: "bg-green-400"  },
  cancelled: { label: "ملغي",        bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400"    },
  returned:  { label: "مسترجع",      bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400" },
};

const getPrice = (source, prices) => {
  const found = prices.find(p => p.source === source);
  return found ? found.price : 0;
};

const orderValue = (order, prices) =>
  (order.quantity || 1) * getPrice(order.source, prices);

export default function OrderCards({
  orders = [],
  prices = [],
  onStatusUpdate,
  onDelete,
  updatingId
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const sources = [...new Set(orders.map(o => o.source).filter(Boolean))];

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      o.name?.toLowerCase().includes(q) ||
      o.phone?.includes(q) ||
      o.city?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSource = sourceFilter === 'all' || o.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  return (
    <div className="w-full">
      {/* SEARCH + FILTER BAR */}
      <div className="space-y-2 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 right-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-9 pl-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-right"
          />
        </div>

        {/* Filters row */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-500 appearance-none text-right cursor-pointer"
          >
            <option value="all">كل الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="called">اتصل</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التسليم</option>
            <option value="cancelled">ملغي</option>
            <option value="returned">مسترجع</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-600 focus:outline-none focus:border-blue-500 appearance-none text-right cursor-pointer"
          >
            <option value="all">كل الصفحات</option>
            {sources.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ORDER COUNT LINE */}
      <p className="text-xs text-slate-400 mb-3 font-medium text-right">
        {filteredOrders.length} طلبية
        {statusFilter !== "all" && ` • ${STATUS[statusFilter]?.label}`}
      </p>

      {/* CARDS CONTAINER */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">لا توجد طلبيات مطابقة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const st = STATUS[order.status] || STATUS.pending;
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 relative"
                dir="rtl"
              >
                {/* ROW 1 — Name + Status badge */}
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-base">
                    {order.name}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>
                    <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>
                    {st.label}
                  </span>
                </div>

                {/* ROW 2 — Phone (tappable) + Wilaya */}
                <div className="flex items-center justify-between text-sm">
                  <a href={`tel:${order.phone}`}
                     className="flex items-center gap-1.5 text-blue-600 font-bold font-mono">
                    <Phone className="w-4 h-4" />
                    {order.phone}
                  </a>
                  <span className="text-slate-500 text-xs font-medium">
                    {order.city}
                  </span>
                </div>

                {/* ROW 3 — Divider line */}
                <div className="h-px bg-slate-100"></div>

                {/* ROW 4 — Product/size + source badge + amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 text-right">
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-lg inline-block">
                      {order.source || "—"}
                    </span>
                    <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                      {order.size || order.product_name || "—"}
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="block text-xs text-slate-400 font-medium">
                      {order.quantity || 1} قطعة
                    </span>
                    <span className="block font-black text-blue-600 text-base">
                      {orderValue(order, prices).toLocaleString()} DA
                    </span>
                  </div>
                </div>

                {/* ROW 5 — Divider line */}
                <div className="h-px bg-slate-100"></div>

                {/* ROW 6 — Status dropdown + Delete button */}
                <div className="flex items-center justify-between gap-3">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 appearance-none disabled:opacity-50 cursor-pointer text-right"
                  >
                    <option value="pending">⏳ في الانتظار</option>
                    <option value="confirmed">🔵 مؤكد</option>
                    <option value="called">📞 اتصل</option>
                    <option value="shipped">🟣 تم الشحن</option>
                    <option value="delivered">🟢 تم التسليم 🔥</option>
                    <option value="cancelled">🔴 ملغي</option>
                    <option value="returned">🔄 مسترجع</option>
                  </select>

                  <button
                    onClick={() => onDelete(order.id)}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 transition-all active:scale-95 cursor-pointer focus:outline-none shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Loading spinner overlay when updating */}
                {updatingId === order.id && (
                  <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
