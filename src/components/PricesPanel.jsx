import React, { useState, useEffect } from 'react';
import { sbFetch } from '../supabase';
import { Settings2, Plus, Save, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function PricesPanel({ clientId, orders = [], prices = [], onPricesSaved }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftPrices, setDraftPrices] = useState({});
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourcePrice, setNewSourcePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-populate / Sync draft prices whenever orders or prices change
  useEffect(() => {
    // 1. Get unique sources from orders list
    const uniqueSources = new Set();
    orders.forEach((o) => {
      if (o.source && o.source.trim() !== '') {
        uniqueSources.add(o.source.trim());
      }
    });

    // 2. Also keep sources already present in the prices list
    prices.forEach((p) => {
      if (p.source && p.source.trim() !== '') {
        uniqueSources.add(p.source.trim());
      }
    });

    // 3. Construct draft dictionary with fallback to 0
    const nextDraft = {};
    uniqueSources.forEach((src) => {
      // Find saved price
      const saved = prices.find(
        (p) => p.source.toLowerCase().trim() === src.toLowerCase().trim()
      );
      nextDraft[src] = saved ? saved.price : 0;
    });

    setDraftPrices(nextDraft);
  }, [orders, prices]);

  const handlePriceChange = (source, value) => {
    const numeric = parseInt(value, 10);
    setDraftPrices((prev) => ({
      ...prev,
      [source]: isNaN(numeric) ? 0 : numeric,
    }));
  };

  const handleAddNewSource = (e) => {
    e.preventDefault();
    const name = newSourceName.trim();
    const priceVal = parseInt(newSourcePrice, 10);

    if (!name) {
      setErrorMessage('يرجى تحديد اسم المنصة أو المصدر');
      return;
    }

    setDraftPrices((prev) => ({
      ...prev,
      [name]: isNaN(priceVal) ? 0 : priceVal,
    }));

    setNewSourceName('');
    setNewSourcePrice('');
    setErrorMessage('');
  };

  const handleSavePrices = async () => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const entries = Object.entries(draftPrices);

      // Save each source prices sequentially or Promise.all. 
      // sbFetch for prices uses unique constraint (client_id, source)
      // The Postgres rules or upsert requires resolution=merge-duplicates.
      // Let's execute API requests for each draft price entry.
      const savePromises = entries.map(([source, price]) => {
        return sbFetch('prices?on_conflict=client_id,source', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({
            client_id: clientId,
            source: source,
            price: price,
          }),
        });
      });

      await Promise.all(savePromises);

      setSuccessMessage('✅ تم حفظ الأسعار بنجاح');
      if (onPricesSaved) {
        onPricesSaved();
      }

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving prices:', err);
      setErrorMessage('حدث خطأ أثناء حفظ قائمة الأسعار المحدثة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl mb-6 overflow-hidden" id="prices-panel-widget" dir="rtl">
      {/* Header Button to Toggle Collapse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-all focus:outline-none"
        id="toggle-prices-btn"
      >
        <div className="flex items-center gap-3">
          <div className="text-emerald-400 bg-emerald-500/10 p-2 rounded-xl">
            <Settings2 className="w-4 h-4" />
          </div>
          <div className="text-right">
            <h4 className="text-sm font-bold text-slate-200">إعداد أسعار المنصات والمصادر</h4>
            <p className="text-[10px] text-slate-500">تخصيص قيمة مبيعات كل مصدر طلب (فيسبوك، أنستغرام، إلخ)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(draftPrices).length > 0 && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold">
              {Object.keys(draftPrices).length} منصات
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-6 border-t border-slate-800/60 space-y-6" id="prices-panel-content">
          {/* List of Prices */}
          <div className="space-y-3.5">
            {Object.keys(draftPrices).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                لا توجد مصادر معروفة بعد. أضف مصدراً جديداً بالأسفل للبدء.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(draftPrices).map(([source, price], idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/60"
                  >
                    <span className="text-xs font-semibold text-slate-300 font-sans pr-2" title={source}>
                      {source}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => handlePriceChange(source, e.target.value)}
                        className="w-24 bg-slate-900 border border-slate-800 text-xs px-2.5 py-2 rounded-xl text-left font-mono font-medium text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">DA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to manual add new source */}
          <form
            onSubmit={handleAddNewSource}
            className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-3"
            id="add-custom-source-form"
          >
            <div className="text-[11px] font-bold text-slate-400 mb-1">إضافة منصة أو مصدر إعلاني جديد يدوياً:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="اسم المنصة (مثال: TikTok)"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                min="0"
                placeholder="السعر بالدينار (DA)"
                value={newSourcePrice}
                onChange={(e) => setNewSourcePrice(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>أضف للقائمة</span>
              </button>
            </div>
          </form>

          {/* Messages & Actions bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-800/40">
            <div>
              {successMessage && (
                <div className="text-emerald-400 text-xs font-semibold" id="prices-success-msg">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="text-red-400 text-[11px] font-medium">
                  {errorMessage}
                </div>
              )}
            </div>

            <button
              onClick={handleSavePrices}
              disabled={loading || Object.keys(draftPrices).length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              id="save-prices-btn"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ جميع الأسعار</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
