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
      setErrorMessage('يرجى تحديد اسم المنتج');
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
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm mb-6 overflow-hidden" id="prices-panel-widget" dir="rtl">
      {/* Header Button to Toggle Collapse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all focus:outline-none"
        id="toggle-prices-btn"
      >
        <div className="flex items-center gap-3">
          <div className="text-[#2563EB] bg-blue-50 p-2 rounded-lg">
            <Settings2 className="w-4 h-4" />
          </div>
          <div className="text-right">
            <h4 className="text-sm font-bold text-[#0F172A]">إعداد أسعار المنتجات</h4>
            <p className="text-[10px] text-slate-500">تخصيص قيمة مبيعات كل منتج (product-a، product-b، إلخ)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(draftPrices).length > 0 && (
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold">
              {Object.keys(draftPrices).length} منتجات
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-6 border-t border-slate-100 space-y-6" id="prices-panel-content">
          {/* List of Prices */}
          <div className="space-y-3.5">
            {Object.keys(draftPrices).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                لا توجد منتجات معروفة بعد. أضف منتجاً جديداً بالأسفل للبدء.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(draftPrices).map(([source, price], idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <span className="text-xs font-semibold text-slate-700 font-sans pr-2" title={source}>
                      {source}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => handlePriceChange(source, e.target.value)}
                        className="w-24 bg-white border border-slate-300 text-xs px-2.5 py-2 rounded-lg text-left font-mono font-medium text-[#0F172A] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-[10px] text-slate-400 font-medium">DA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to manual add new source */}
          <form
            onSubmit={handleAddNewSource}
            className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
            id="add-custom-source-form"
          >
            <div className="text-[11px] font-bold text-slate-500 mb-1">إضافة منتج جديد يدوياً:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="اسم المنتج (مثال: product-a)"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                className="bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                min="0"
                placeholder="السعر بالدينار (DA)"
                value={newSourcePrice}
                onChange={(e) => setNewSourcePrice(e.target.value)}
                className="bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="submit"
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>أضف للقائمة</span>
              </button>
            </div>
          </form>

          {/* Messages & Actions bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
            <div>
              {successMessage && (
                <div className="text-green-600 text-xs font-semibold" id="prices-success-msg">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="text-red-500 text-[11px] font-medium">
                  {errorMessage}
                </div>
              )}
            </div>

            <button
              onClick={handleSavePrices}
              disabled={loading || Object.keys(draftPrices).length === 0}
              className="bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
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
