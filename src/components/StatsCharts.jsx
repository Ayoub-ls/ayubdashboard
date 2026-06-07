import React from 'react';

export default function StatsCharts({ orders = [], prices = [] }) {
  // Helper to get price for a specific source
  const getPrice = (source, pricesList) => {
    if (!source) return 0;
    const priceEntry = pricesList.find(
      (p) => p.source?.toLowerCase().trim() === source.toLowerCase().trim()
    );
    return priceEntry ? priceEntry.price : 0;
  };

  // ==========================================
  // CHART 1: Top 5 Wilayas
  // ==========================================
  const cityCounts = {};
  orders.forEach((o) => {
    const city = o.city ? o.city.trim() : 'غير محدد';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  const sortedWilayas = Object.entries(cityCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxWilayaCount = sortedWilayas.length > 0 ? sortedWilayas[0].count : 1;

  // ==========================================
  // CHART 2: Revenue per source
  // ==========================================
  const sourceRevenues = {};
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');

  activeOrders.forEach((o) => {
    const source = o.source ? o.source.trim() : 'غير محدد';
    const price = getPrice(source, prices);
    const qty = o.quantity || 1;
    const rev = qty * price;
    sourceRevenues[source] = (sourceRevenues[source] || 0) + rev;
  });

  const sortedSources = Object.entries(sourceRevenues)
    .map(([name, revenue]) => {
      const pricePerUnit = getPrice(name, prices);
      return { name, revenue, pricePerUnit };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const maxSourceRevenue = sortedSources.length > 0 ? sortedSources[0].revenue : 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" id="stats-charts-container" dir="rtl">
      {/* CHART 1: Top 5 Wilayas */}
      <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-6 text-slate-300 border-r-4 border-emerald-500 pr-3">
          أعلى 5 ولايات
        </h3>
        {sortedWilayas.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">لا توجد بيانات متاحة حالياً</p>
        ) : (
          <div className="space-y-4">
            {sortedWilayas.map((item, idx) => {
              const percentage = Math.max((item.count / maxWilayaCount) * 100, 4); // Always show at least a small bar
              return (
                <div key={idx} className="space-y-1.5" id={`wilaya-bar-${idx}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 font-medium">{item.name}</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {item.count} طلبيات
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                    <div 
                      className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHART 2: Revenue per source */}
      <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-sm font-semibold text-slate-300 border-r-4 border-indigo-500 pr-3">
            الإيرادات حسب مصدر الطلب
          </h3>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg">
            إجمالي نشط
          </span>
        </div>

        {sortedSources.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-10 my-auto">لا توجد مبيعات نشطة حالياً</p>
        ) : (
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {sortedSources.map((item, idx) => {
              const percentage = Math.max((item.revenue / maxSourceRevenue) * 100, 3); // minimum layout bar
              return (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4" id={`source-bar-${idx}`}>
                  <div className="w-full sm:w-28 text-xs font-medium text-slate-300 flex flex-col">
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-500 font-sans mt-0.5">
                      {item.pricePerUnit > 0 ? `${item.pricePerUnit.toLocaleString()} DA للقطعة` : 'لم يحدد سعر'}
                    </span>
                  </div>
                  <div className="flex-1 h-9 bg-slate-950 rounded-2xl flex items-center pr-3 border border-slate-850 relative overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-indigo-600 to-indigo-400 opacity-80 transition-all duration-500 rounded-r-2xl"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="relative z-10 text-[11px] mr-3 font-mono text-white font-bold drop-shadow-sm">
                      {item.revenue.toLocaleString()} DA
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
