import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sbFetch } from '../supabase';
import KPICards from '../components/KPICards';
import StatsCharts from '../components/StatsCharts';
import PricesPanel from '../components/PricesPanel';
import Toast from '../components/Toast';
import {
  LogOut,
  Plus,
  Search,
  SlidersHorizontal,
  Globe,
  Settings,
  KeyRound,
  Sparkles,
  ShoppingBag,
  Trash2,
  Calendar,
  X,
  Lock,
  Eye,
  CheckCircle,
  Truck,
  RotateCcw,
  Check
} from 'lucide-react';

const TRANSLATIONS = {
  ar: {
    dashboardTitle: "لوحة التحكم",
    subTitle: "نظام إدارة المبيعات للـ COD",
    logout: "تسجيل الخروج",
    changePassword: "تغيير كلمة المرور",
    searchPlaceholder: "بحث عن زبون بالاسم أو الهاتف...",
    statusAll: "كل الحالات",
    statusPending: "في الانتظار",
    statusShipped: "تم الشحن",
    statusDelivered: "تم التسليم",
    statusCancelled: "ملغي",
    showCount: "عرض {count} من أصل {total} طلب",
    customer: "الزبون",
    wilaya: "الولاية / المدينة",
    productSize: "المنتج والمقاس",
    qty: "الكمية",
    priceAmount: "المبلغ",
    status: "الحالة",
    actions: "الإجراءات",
    addOrderTitle: "إضافة طلبية جديدة",
    editPasswordTitle: "تحديث كلمة مرور الحساب",
    clientName: "اسم العميل",
    passwordPlaceholder: "كلمة المرور الجديدة",
    currentPassword: "كلمة المرور الحالية لتأكيد الهوية",
    save: "حفظ البيانات",
    cancel: "إلغاء",
    customerNameLabel: "اسم الزبون الكامل",
    phoneLabel: "رقم الهاتف",
    wilayaLabel: "الولاية",
    sizeLabel: "المقاس (اختياري)",
    sourceLabel: "نوع المنتج / الموديل",
    productNameLabel: "اسم المنتج",
    addOrderBtn: "إضافة الطلب",
    updating: "جاري التحديث...",
    addSuccess: "✅ تم إضافة الطلبية بنجاح",
    deleteSuccess: "🗑️ تم حذف الطلبية بنجاح",
    passwordSuccess: "🔑 تم تغيير كلمة المرور بنجاح",
    deleteConfirm: "هل أنت متأكد من حذف هذه الطلبية؟"
  },
  en: {
    dashboardTitle: "Dashboard",
    subTitle: "Sales Management System for COD",
    logout: "Log Out",
    changePassword: "Change Password",
    searchPlaceholder: "Search customer by name or phone...",
    statusAll: "All Statuses",
    statusPending: "Pending",
    statusShipped: "Shipped",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",
    showCount: "Showing {count} of {total} orders",
    customer: "Customer",
    wilaya: "City / Wilaya",
    productSize: "Product & Size",
    qty: "Quantity",
    priceAmount: "Amount",
    status: "Status",
    actions: "Actions",
    addOrderTitle: "Add New Order",
    editPasswordTitle: "Update Account Password",
    clientName: "Client Name",
    passwordPlaceholder: "New password",
    currentPassword: "Current password to confirm",
    save: "Save",
    cancel: "Cancel",
    customerNameLabel: "Customer Full Name",
    phoneLabel: "Phone Number",
    wilayaLabel: "City/Wilaya",
    sizeLabel: "Size (Optional)",
    sourceLabel: "Product Model",
    productNameLabel: "Product Name",
    addOrderBtn: "Add Order",
    updating: "Updating...",
    addSuccess: "✅ Order successfully added",
    deleteSuccess: "🗑️ Order successfully deleted",
    passwordSuccess: "🔑 Password successfully updated",
    deleteConfirm: "Are you sure you want to delete this order?"
  },
  fr: {
    dashboardTitle: "Tableau de Bord",
    subTitle: "Gestion des ventes pour COD-Ecom",
    logout: "Se Déconnecter",
    changePassword: "Modifier le mot de passe",
    searchPlaceholder: "Rechercher client par nom ou téléphone...",
    statusAll: "Tous les statuts",
    statusPending: "En attente",
    statusShipped: "Expédié",
    statusDelivered: "Livré",
    statusCancelled: "Annulé",
    showCount: "Affichage de {count} sur {total} commandes",
    customer: "Client",
    wilaya: "Ville / Wilaya",
    productSize: "Produit & Taille",
    qty: "Quantité",
    priceAmount: "Montant",
    status: "Statut",
    actions: "Actions",
    addOrderTitle: "Ajouter une Commande",
    editPasswordTitle: "Mettre à jour le mot de passe",
    clientName: "Nom de Client",
    passwordPlaceholder: "Nouveau mot de passe",
    currentPassword: "Mot de passe actuel pour confirmer",
    save: "Enregistrer",
    cancel: "Annuler",
    customerNameLabel: "Nom complet du client",
    phoneLabel: "Numéro de téléphone",
    wilayaLabel: "Ville / Wilaya",
    sizeLabel: "Taille (Optionnel)",
    sourceLabel: "Modèle de produit",
    productNameLabel: "Nom du produit",
    addOrderBtn: "Créer la commande",
    updating: "Mise à jour...",
    addSuccess: "✅ Commande ajoutée avec succès",
    deleteSuccess: "🗑️ Commande supprimée avec succès",
    passwordSuccess: "🔑 Mot de passe mis à jour avec succès",
    deleteConfirm: "Voulez-vous vraiment supprimer cette commande ?"
  }
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const clientId = sessionStorage.getItem("client_id") || "";
  const clientName = sessionStorage.getItem("client_name") || "العميل";

  // Custom Lang: 'ar' | 'en' | 'fr'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("dashboard_lang") || "ar";
  });

  const t = TRANSLATIONS[lang];
  const isRtl = lang === "ar";

  // App States
  const [orders, setOrders] = useState([]);
  const [prices, setPrices] = useState([]);


  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Toasts
  const [toast, setToast] = useState(null);

  // New Order Form Draft
  const [newOrder, setNewOrder] = useState({
    name: '',
    phone: '',
    city: '',
    size: '42',
    quantity: 1,
    product_name: '',
    source: 'product-a',
    status: 'pending'
  });

  // Password Update Form Draft
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Fetch full data
  const fetchData = async () => {
    if (!clientId) {
      navigate('/');
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch Orders for current client
      const ordersData = await sbFetch(`orders?client_id=eq.${clientId}&order=created_at.desc`);
      setOrders(ordersData || []);

      // 2. Fetch Prices for current client
      const pricesData = await sbFetch(`prices?client_id=eq.${clientId}`);
      setPrices(pricesData || []);


    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      showNotification("حدث خطأ أثناء تحميل البيانات من الخادم", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prices.length > 0) {
      const prodList = prices.map(p => p.source).filter(Boolean);
      if (prodList.length > 0 && !prodList.includes(newOrder.source)) {
        setNewOrder(prev => ({ ...prev, source: prodList[0] }));
      }
    }
  }, [prices]);

  useEffect(() => {
    fetchData();
  }, [clientId]);

  // Handle showing custom toast messages
  const showNotification = (message, type = "success") => {
    setToast({ message, type });
  };

  // Language Change handler
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem("dashboard_lang", newLang);
  };



  // Add Order Handler
  const handleAddOrderSubmit = async (e) => {
    e.preventDefault();
    if (!newOrder.name.trim() || !newOrder.phone.trim() || !newOrder.product_name.trim()) {
      showNotification(isRtl ? "يرجى تعبئة الحقول المطلوبة" : "Please fill in all required fields", "error");
      return;
    }

    try {
      const response = await sbFetch("orders", {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          name: newOrder.name.trim(),
          phone: newOrder.phone.trim(),
          city: newOrder.city.trim() || "الجزائر",
          size: newOrder.size.trim(),
          quantity: parseInt(newOrder.quantity) || 1,
          product_name: newOrder.product_name.trim(),
          source: newOrder.source,
          status: newOrder.status
        })
      });

      if (response) {
        showNotification(t.addSuccess, "success");
        setIsAddOrderOpen(false);
        // Reset form
        setNewOrder({
          name: '',
          phone: '',
          city: '',
          size: '42',
          quantity: 1,
          product_name: '',
          source: 'product-a',
          status: 'pending'
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showNotification("تعذر إضافة الطلبية لقاعدة البيانات", "error");
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      await sbFetch(`orders?id=eq.${orderId}`, {
        method: "DELETE"
      });
      showNotification(t.deleteSuccess, "grey");
      fetchData();
    } catch (err) {
      console.error(err);
      showNotification("حدث خطأ أثناء محاولة حذف الطلبية", "error");
    }
  };

  // Get price for a specific platform/source
  const getSourcePrice = (source) => {
    if (!source) return 0;
    const found = prices.find(p => p.source?.toLowerCase().trim() === source.toLowerCase().trim());
    return found ? found.price : 0;
  };

  // Update order status with real-time Pixel Fire event simulation
  const handleUpdateStatus = async (orderId, newStatus, orderItem) => {
    try {
      const updated = await sbFetch(`orders?id=eq.${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });

      if (updated) {
        showNotification(
          isRtl ? `تم تحديث حالة الطلبية إلى: ${getArabicStatus(newStatus)}` : `Status updated to: ${newStatus}`,
          "success"
        );



        // Reload data
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showNotification("فشل تحديث حالة الطلب", "error");
    }
  };

  const getArabicStatus = (status) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  // Change Password
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');

    if (!pwdCurrent.trim() || !pwdNew.trim()) {
      setPwdError("الرجاء ملء كافة الحقول");
      return;
    }

    try {
      // 1. Double check current password
      const clientProfile = await sbFetch(`clients?id=eq.${clientId}`);
      if (!clientProfile || clientProfile.length === 0) {
        setPwdError("تعذر العثور على ملف العميل");
        return;
      }

      if (clientProfile[0].password !== pwdCurrent) {
        setPwdError("كلمة المرور الحالية غير صحيحة");
        return;
      }

      // 2. Patch new password
      const updated = await sbFetch(`clients?id=eq.${clientId}`, {
        method: "PATCH",
        body: JSON.stringify({ password: pwdNew.trim() })
      });

      if (updated) {
        showNotification(t.passwordSuccess, "success");
        setIsPasswordModalOpen(false);
        setPwdCurrent('');
        setPwdNew('');
      }
    } catch (err) {
      console.error(err);
      setPwdError("حدث خطأ أثناء محاولة تحديث كلمة المرور");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  // Filters logic
  const filteredOrders = orders.filter((order) => {
    const text = searchQuery.toLowerCase();
    const matchesSearch =
      order.name?.toLowerCase().includes(text) ||
      order.phone?.toLowerCase().includes(text) ||
      order.product_name?.toLowerCase().includes(text);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || order.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Extract unique platforms for filtering
  const uniquePlatformSources = Array.from(
    new Set(orders.map((o) => o.source).filter((s) => s && s.trim() !== ''))
  );

  const availableProducts = prices.length > 0
    ? Array.from(new Set(prices.map(p => p.source).filter(Boolean)))
    : ['product-a', 'product-b'];

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-5 sm:p-8 selection:bg-emerald-500/30 selection:text-emerald-200"
      dir={isRtl ? "rtl" : "ltr"}
      id="client-dashboard-layout"
    >
      {/* HEADER NAVBAR */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 border-b border-slate-800/60 pb-6" id="dashboard-header">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl shrink-0 border border-emerald-500/20">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {clientName}
            </h1>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{t.subTitle}</span>
              <span className="text-slate-700">•</span>
              <span className="font-mono text-slate-600 uppercase tracking-wider text-[9px]">ID: {clientId}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Language Selector */}
        <div className="flex flex-wrap items-center gap-2.5" id="navbar-actions">

          {/* Languages Dropdown/Toggle Group */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5" id="lang-switch-group">
            <button
              onClick={() => handleLanguageChange('ar')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'ar' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              عربي
            </button>
            <button
              onClick={() => handleLanguageChange('fr')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'fr' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Fr
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              En
            </button>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
            id="change-pwd-btn"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{t.changePassword}</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 text-xs bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-300 rounded-xl transition-all font-semibold flex items-center gap-1.5 active:scale-95 border border-slate-700 hover:border-red-900/30"
            id="logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </header>

      {/* DYNAMIC KPI CARDS (Real-time analytics) */}
      <KPICards orders={orders} prices={prices} />

      {/* STATS AND VISUAL CHARTS */}
      <StatsCharts orders={orders} prices={prices} />

      {/* CONFIG PANEL: SOURCE PRICING WIDGET */}
      <PricesPanel
        clientId={clientId}
        orders={orders}
        prices={prices}
        onPricesSaved={fetchData}
      />

      {/* TABLE FILTERS & DATA GRID CONTROLS */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl flex flex-col overflow-hidden" id="data-grid-section">
        {/* Table Filter Top Bar */}
        <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search input field */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs px-10 py-2.5 rounded-xl w-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-right"
              />
            </div>

            {/* Status dropdown filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl focus:outline-none text-slate-300 min-w-[120px]"
            >
              <option value="all">🔍 {t.statusAll}</option>
              <option value="pending">⏳ {t.statusPending}</option>
              <option value="shipped">📦 {t.statusShipped}</option>
              <option value="delivered">✅ {t.statusDelivered}</option>
              <option value="cancelled">❌ {t.statusCancelled}</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl focus:outline-none text-slate-300 min-w-[130px]"
            >
              <option value="all">📦 جميع المنتجات</option>
              {uniquePlatformSources.map((source, i) => (
                <option key={i} value={source}>{source}</option>
              ))}
            </select>
          </div>

          {/* Action Trigger button to Add Order */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
              {t.showCount.replace("{count}", filteredOrders.length).replace("{total}", orders.length)}
            </span>
            <button
              onClick={() => setIsAddOrderOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              id="open-add-order-modal-btn"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addOrderTitle}</span>
            </button>
          </div>
        </div>

        {/* MAIN DATA GRID TABLE */}
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 px-4" id="empty-table-state">
              <p className="text-slate-400 text-sm font-semibold mb-2">لا توجد طلبيات مطابقة لمعايير البحث والفرز</p>
              <p className="text-slate-600 text-xs">أضف طلبيات جديدة أو اضبط حقول الفلترة بالأعلى.</p>
            </div>
          ) : (
            <table className="w-full text-right" id="orders-main-table">
              <thead>
                <tr className="sticky top-0 bg-slate-900 text-[10px] md:text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-3 md:py-5 md:px-6 font-bold text-right">{t.customer}</th>
                  <th className="py-3 px-3 md:py-5 md:px-6 font-bold text-right">{t.wilaya}</th>
                  <th className="py-3 px-3 md:py-5 md:px-6 font-bold text-right">{t.productSize}</th>
                  <th className="py-3 px-3 md:py-5 md:px-6 font-bold text-center">{t.qty}</th>
                  <th className="py-3 px-3 md:py-5 md:px-6 font-bold text-right">{t.priceAmount}</th>
                  <th className="py-3 px-3 md:py-5 md:px-6 font-bold text-right">رأس المال / المصدر</th>
                  <th className="py-3 px-3 md:py-5 md:px-6 font-bold text-center">{t.status}</th>
                  <th className="py-3 px-3 md:py-5 md:px-6 font-bold text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="text-xs md:text-sm">
                {filteredOrders.map((order, idx) => {
                  const singlePrice = getSourcePrice(order.source);
                  const totalOrderPrice = singlePrice * (order.quantity || 1);
                  return (
                    <tr
                      key={order.id || idx}
                      className={`hover:bg-slate-800/50 transition-colors border-b border-slate-800/30 ${idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-950'}`}
                      id={`order-row-${order.id}`}
                    >
                      {/* Customer Details */}
                      <td className="py-3 px-3 md:py-5 md:px-6">
                        <div className="font-bold text-slate-100 text-xs md:text-sm whitespace-nowrap">{order.name}</div>
                        <div className="text-[10px] md:text-xs text-slate-500 font-mono mt-0.5 md:mt-1 whitespace-nowrap">{order.phone}</div>
                      </td>

                      {/* City/Wilaya */}
                      <td className="py-3 px-3 md:py-5 md:px-6 text-slate-300 font-medium text-xs md:text-sm">
                        {order.city || "غير محدد"}
                      </td>

                      {/* Product & Size */}
                      <td className="py-3 px-3 md:py-5 md:px-6">
                        <span className="text-xs md:text-sm text-slate-200">{order.product_name || "منتج عام"}</span>
                        {order.size && (
                          <span className="text-[10px] md:text-sm bg-slate-800 text-white border border-fuchsia-700 rounded-md px-1.5 md:px-2 py-0.5 mr-1.5 md:mr-2 font-mono">
                            {order.size}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 md:py-5 md:px-6 text-center font-mono font-bold text-orange-400 text-xs md:text-sm">
                        {order.quantity || 1}
                      </td>

                      {/* Cash value */}
                      <td className="py-3 px-3 md:py-5 md:px-6 font-mono font-bold text-xs md:text-sm">
                        {totalOrderPrice > 0 ? (
                          <span className="text-emerald-400 whitespace-nowrap">
                            {totalOrderPrice.toLocaleString()} <span className="text-[9px] md:text-xs font-normal text-slate-500">DA</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px] md:text-xs">0 DA</span>
                        )}
                      </td>

                      {/* Source badge marker */}
                      <td className="py-3 px-3 md:py-5 md:px-6">
                        <span className="text-[10px] md:text-xs font-medium bg-slate-800 border border-fuchsia-700 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-white">
                          {order.source || "غير معروف"}
                        </span>
                      </td>

                      {/* Live status management status buttons / select dropdown */}
                      <td className="py-3 px-3 md:py-5 md:px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5 md:gap-2">
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value, order)}
                            className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 md:py-2 rounded-full border focus:outline-none cursor-pointer min-w-[85px] md:min-w-[110px] ${order.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : order.status === 'shipped'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                : order.status === 'cancelled'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                          >
                            <option value="pending">⏳ {t.statusPending}</option>
                            <option value="shipped">📦 {t.statusShipped}</option>
                            <option value="delivered">✅ {t.statusDelivered}</option>
                            <option value="cancelled">❌ {t.statusCancelled}</option>
                          </select>

                        </div>
                      </td>

                      {/* Deletion and updates */}
                      <td className="py-3 px-3 md:py-5 md:px-6 text-center">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 md:p-2 hover:bg-red-900/20 hover:text-red-400 text-slate-600 rounded-lg transition-all cursor-pointer"
                          title="حذف الطلبية"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD NEW ORDER */}
      {isAddOrderOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          id="add-order-modal-backdrop"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setIsAddOrderOpen(false)}
              className="absolute top-4 left-4 p-1.5 bg-slate-950 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <span>{t.addOrderTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">سجل تفاصيل الطلبية الجديدة التي استلمتها مباشرة وسيتم حساب الإحصائيات فوراً.</p>

            <form onSubmit={handleAddOrderSubmit} className="space-y-4" id="add-order-modal-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.customerNameLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد بوعلام"
                    value={newOrder.name}
                    onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.phoneLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="0554 12 34 56"
                    value={newOrder.phone}
                    onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.wilayaLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="الجزائر، وهران، سطيف..."
                    value={newOrder.city}
                    onChange={(e) => setNewOrder({ ...newOrder, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.sizeLabel}</label>
                  <input
                    type="text"
                    placeholder="42 / XL / Standard"
                    value={newOrder.size}
                    onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.qty} *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.productNameLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حذاء رياضي كلاسيكي"
                    value={newOrder.product_name}
                    onChange={(e) => setNewOrder({ ...newOrder, product_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.sourceLabel} *</label>
                  <select
                    value={newOrder.source}
                    onChange={(e) => setNewOrder({ ...newOrder, source: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {availableProducts.map((prod, i) => (
                      <option key={i} value={prod}>{prod}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOrderOpen(false)}
                  className="px-4 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  id="submit-new-order-btn"
                >
                  {t.addOrderBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE CLIENT ACCOUNT PASSWORD */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          id="password-modal-backdrop"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 bg-slate-950 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>{t.changePassword}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">حدث كلمة مرور حسابك للوصول الآمن مرة أخرى للوحة تحكم COD الخاصة بك.</p>

            {pwdError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[11px] text-right">
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4" id="password-modal-form">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.currentPassword}</label>
                <input
                  type="password"
                  required
                  placeholder="كلمة المرور الحالية"
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.passwordPlaceholder}</label>
                <input
                  type="password"
                  required
                  placeholder="كلمة المرور الجديدة"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  id="submit-password-change-btn"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING ACTION TOAST POPUP NOTIFICATION SCREEN */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
