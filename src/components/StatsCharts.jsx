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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6" id="stats-charts-container" dir="rtl">
      {/* CHART 1: Top 5 Wilayas */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">
          أعلى 5 ولايات
        </h3>
        {sortedWilayas.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">لا توجد بيانات متاحة حالياً</p>
        ) : (
          <div className="space-y-4">
            {sortedWilayas.map((item, idx) => {
              const percentage = Math.max((item.count / maxWilayaCount) * 100, 4);
              return (
                <div key={idx} className="space-y-1.5" id={`wilaya-bar-${idx}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 font-medium">{item.name}</span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">
                      {item.count} طلبيات
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
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
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 flex flex-col">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">
          الإيرادات حسب مصدر الطلب
        </h3>

        {sortedSources.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-10 my-auto">لا توجد مبيعات نشطة حالياً</p>
        ) : (
          <div className="flex-1 flex flex-col justify-center space-y-3.5">
            {sortedSources.map((item, idx) => {
              const percentage = Math.max((item.revenue / maxSourceRevenue) * 100, 3);
              return (
                <div key={idx} className="space-y-1.5" id={`source-bar-${idx}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 font-medium">{item.name}</span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">
                      {item.revenue.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500/80 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
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
