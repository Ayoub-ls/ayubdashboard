import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sbFetch } from '../supabase';
import KPICards from '../components/KPICards';
import StatsCharts from '../components/StatsCharts';
import PricesPanel from '../components/PricesPanel';
import Toast from '../components/Toast';
import OrderCards from './OrderCards';
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
  Check,
  LayoutDashboard,
  ShoppingCart,
  Tag,
  RefreshCw,
  Code2
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
    statusConfirmed: "مؤكد",
    statusCalled: "اتصل",
    statusShipped: "تم الشحن",
    statusDelivered: "تم التسليم",
    statusCancelled: "ملغي",
    statusReturned: "مسترجع",
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
    statusConfirmed: "Confirmed",
    statusCalled: "Called",
    statusShipped: "Shipped",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",
    statusReturned: "Returned",
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
    statusConfirmed: "Confirmé",
    statusCalled: "Appelé",
    statusShipped: "Expédié",
    statusDelivered: "Livré",
    statusCancelled: "Annulé",
    statusReturned: "Retourné",
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
  const [updatingId, setUpdatingId] = useState(null);

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
    setUpdatingId(orderId);
    try {
      await sbFetch(`orders?id=eq.${orderId}`, {
        method: "DELETE"
      });
      showNotification(t.deleteSuccess, "grey");
      fetchData();
    } catch (err) {
      console.error(err);
      showNotification("حدث خطأ أثناء محاولة حذف الطلبية", "error");
    } finally {
      setUpdatingId(null);
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
    setUpdatingId(orderId);
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
    } finally {
      setUpdatingId(null);
    }
  };

  const getArabicStatus = (status) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'called': return 'اتصل';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      case 'returned': return 'مسترجع';
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

  const [activeNav, setActiveNav] = useState('dashboard');

  const navLinks = [
    { id: 'dashboard', icon: LayoutDashboard, label: isRtl ? 'لوحة التحكم' : 'Dashboard' },
    { id: 'orders', icon: ShoppingCart, label: isRtl ? 'الطلبات' : 'Orders' },
    { id: 'prices', icon: Tag, label: isRtl ? 'الأسعار' : 'Prices' },
    { id: 'settings', icon: Settings, label: isRtl ? 'الإعدادات' : 'Settings' },
  ];

  return (
    <div
      className="min-h-screen bg-[#F8F9FC] flex"
      dir={isRtl ? "rtl" : "ltr"}
      id="client-dashboard-layout"
    >
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-20 gap-4" id="dashboard-header">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl shrink-0">
              <ShoppingBag className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-[#0F172A] truncate">{clientName}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">ID: {clientId}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3" id="navbar-actions">
            {/* Language switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5" id="lang-switch-group">
              {['ar', 'fr', 'en'].map(l => (
                <button key={l} onClick={() => handleLanguageChange(l)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${lang === l ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                  {l === 'ar' ? 'عربي' : l === 'fr' ? 'Fr' : 'En'}
                </button>
              ))}
            </div>

            <button onClick={fetchData} className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg border border-slate-200 transition-all" title="تحديث">
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3 py-2 text-xs text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all flex items-center gap-1.5"
              id="change-pwd-btn"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t.changePassword}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-all cursor-pointer"
              id="logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 p-6 overflow-auto">

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

          {/* Desktop table */}
          <div className="hidden md:block">
            {/* TABLE FILTERS & DATA GRID CONTROLS */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col overflow-hidden" id="data-grid-section">
              {/* Tab Filters */}
              <div className="flex items-center border-b border-slate-100 px-4 gap-1 overflow-x-auto">
                {[
                  { key: 'all', label: isRtl ? 'كل الطلبات' : 'All' },
                  { key: 'confirmed', label: isRtl ? 'مؤكد' : 'Confirmed' },
                  { key: 'pending', label: isRtl ? 'في الانتظار' : 'Pending' },
                  { key: 'called', label: isRtl ? 'اتصل' : 'Called' },
                  { key: 'cancelled', label: isRtl ? 'ملغي' : 'Cancelled' },
                  { key: 'returned', label: isRtl ? 'مسترجع' : 'Returned' },
                  { key: 'shipped', label: isRtl ? 'تم الشحن' : 'Shipped' },
                  { key: 'delivered', label: isRtl ? 'تم التسليم' : 'Delivered' },
                ].map(tab => {
                  const count = tab.key === 'all' ? orders.length : orders.filter(o => o.status === tab.key).length;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setStatusFilter(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${statusFilter === tab.key
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      {tab.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === tab.key ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                        }`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Table Toolbar */}
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white border border-slate-300 text-xs px-10 py-2.5 rounded-lg w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-right text-slate-700 placeholder-slate-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg focus:outline-none text-slate-600 min-w-[130px]"
                  >
                    <option value="all">جميع المنتجات</option>
                    {uniquePlatformSources.map((source, i) => (
                      <option key={i} value={source}>{source}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                    {t.showCount.replace("{count}", filteredOrders.length).replace("{total}", orders.length)}
                  </span>
                  <button
                    onClick={() => setIsAddOrderOpen(true)}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
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
                      <tr className="sticky top-0 bg-slate-50 text-[10px] md:text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-4 px-4 font-bold text-right">{t.customer}</th>
                        <th className="py-4 px-4 font-bold text-right">{t.wilaya}</th>
                        <th className="py-4 px-4 font-bold text-right">{t.productSize}</th>
                        <th className="py-4 px-4 font-bold text-center">{t.qty}</th>
                        <th className="py-4 px-4 font-bold text-right">{t.priceAmount}</th>
                        <th className="py-4 px-4 font-bold text-right">المصدر</th>
                        <th className="py-4 px-4 font-bold text-center">{t.status}</th>
                        <th className="py-4 px-4 font-bold text-center">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm divide-y divide-slate-100">
                      {filteredOrders.map((order, idx) => {
                        const singlePrice = getSourcePrice(order.source);
                        const totalOrderPrice = singlePrice * (order.quantity || 1);
                        return (
                          <tr
                            key={order.id || idx}
                            className="hover:bg-slate-50 transition-colors bg-white"
                            id={`order-row-${order.id}`}
                          >
                            {/* Customer Details */}
                            <td className="py-4 px-4">
                              <div className="font-bold text-[#0F172A] text-xs md:text-sm whitespace-nowrap">{order.name}</div>
                              <div className="text-[10px] md:text-xs text-slate-500 font-mono mt-0.5 whitespace-nowrap">{order.phone}</div>
                            </td>

                            {/* City/Wilaya */}
                            <td className="py-4 px-4 text-slate-700 font-medium text-xs md:text-sm">
                              {order.city || "غير محدد"}
                            </td>

                            {/* Product & Size */}
                            <td className="py-4 px-4">
                              <span className="text-xs md:text-sm text-slate-700">{order.product_name || "منتج عام"}</span>
                              {order.size && (
                                <span className="text-[10px] md:text-xs bg-slate-100 text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 mr-1.5 font-mono">
                                  {order.size}
                                </span>
                              )}
                            </td>

                            {/* Quantity */}
                            <td className="py-4 px-4 text-center font-mono font-bold text-[#0F172A] text-xs md:text-sm">
                              {order.quantity || 1}
                            </td>

                            {/* Cash value */}
                            <td className="py-4 px-4 font-mono font-bold text-xs md:text-sm">
                              {totalOrderPrice > 0 ? (
                                <span className="text-[#2563EB] whitespace-nowrap">
                                  {totalOrderPrice.toLocaleString()} <span className="text-[9px] md:text-xs font-normal text-slate-400">DA</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px] md:text-xs">0 DA</span>
                              )}
                            </td>

                            {/* Source badge marker */}
                            <td className="py-4 px-4">
                              <span className="text-[10px] md:text-xs font-medium bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full text-blue-600">
                                {order.source || "غير معروف"}
                              </span>
                            </td>

                            {/* Live status management status buttons / select dropdown */}
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <select
                                  value={order.status || 'pending'}
                                  onChange={(e) => handleUpdateStatus(order.id, e.target.value, order)}
                                  className={`text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-full border focus:outline-none cursor-pointer min-w-[85px] md:min-w-[110px] ${
                                    order.status === 'delivered'
                                      ? 'bg-green-50 text-green-600 border-green-200'
                                      : order.status === 'shipped'
                                        ? 'bg-purple-50 text-purple-600 border-purple-200'
                                        : order.status === 'cancelled'
                                          ? 'bg-red-50 text-red-600 border-red-200'
                                          : order.status === 'confirmed'
                                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                                            : order.status === 'called'
                                              ? 'bg-cyan-50 text-cyan-600 border-cyan-200'
                                              : order.status === 'returned'
                                                ? 'bg-orange-50 text-orange-600 border-orange-200'
                                                : 'bg-amber-50 text-amber-600 border-amber-200'
                                  }`}
                                >
                                  <option value="pending">⏳ {t.statusPending}</option>
                                  <option value="confirmed">🔵 {t.statusConfirmed}</option>
                                  <option value="called">📞 {t.statusCalled}</option>
                                  <option value="shipped">📦 {t.statusShipped}</option>
                                  <option value="delivered">✅ {t.statusDelivered}</option>
                                  <option value="cancelled">❌ {t.statusCancelled}</option>
                                  <option value="returned">🔄 {t.statusReturned}</option>
                                </select>
                              </div>
                            </td>

                            {/* Deletion and updates */}
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1.5 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg transition-all cursor-pointer"
                                title="حذف الطلبية"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>

          {/* Mobile cards */}
          <div className="block md:hidden">
            {/* Mobile header with Add Order Button */}
            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F172A]">إدارة الطلبات</h2>
              <button
                onClick={() => setIsAddOrderOpen(true)}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-3.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addOrderTitle}</span>
              </button>
            </div>
            <OrderCards
              orders={orders}
              prices={prices}
              onStatusUpdate={handleUpdateStatus}
              onDelete={handleDeleteOrder}
              updatingId={updatingId}
            />
          </div>

          {/* MODAL 1: ADD NEW ORDER */}
          {isAddOrderOpen && (
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              id="add-order-modal-backdrop"
            >
              <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 sm:p-8 relative shadow-xl">
                <button
                  onClick={() => setIsAddOrderOpen(false)}
                  className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#2563EB]" />
                  <span>{t.addOrderTitle}</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">سجل تفاصيل الطلبية الجديدة التي استلمتها مباشرة وسيتم حساب الإحصائيات فوراً.</p>

                <form onSubmit={handleAddOrderSubmit} className="space-y-4" id="add-order-modal-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.customerNameLabel} *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: أحمد بوعلام"
                        value={newOrder.name}
                        onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.phoneLabel} *</label>
                      <input
                        type="text"
                        required
                        placeholder="0554 12 34 56"
                        value={newOrder.phone}
                        onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.wilayaLabel} *</label>
                      <input
                        type="text"
                        required
                        placeholder="الجزائر، وهران، سطيف..."
                        value={newOrder.city}
                        onChange={(e) => setNewOrder({ ...newOrder, city: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.sizeLabel}</label>
                      <input
                        type="text"
                        placeholder="42 / XL / Standard"
                        value={newOrder.size}
                        onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.qty} *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newOrder.quantity}
                        onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.productNameLabel} *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: حذاء رياضي كلاسيكي"
                        value={newOrder.product_name}
                        onChange={(e) => setNewOrder({ ...newOrder, product_name: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.sourceLabel} *</label>
                      <select
                        value={newOrder.source}
                        onChange={(e) => setNewOrder({ ...newOrder, source: e.target.value })}
                        className="w-full bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500"
                      >
                        {availableProducts.map((prod, i) => (
                          <option key={i} value={prod}>{prod}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddOrderOpen(false)}
                      className="px-4 py-2 text-xs bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg border border-slate-300 transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-sm cursor-pointer"
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              id="password-modal-backdrop"
            >
              <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 sm:p-8 relative shadow-xl">
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="absolute top-4 left-4 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>{t.changePassword}</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6">حدث كلمة مرور حسابك للوصول الآمن مرة أخرى للوحة تحكم COD الخاصة بك.</p>

                {pwdError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-[11px] text-right">
                    {pwdError}
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4" id="password-modal-form">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.currentPassword}</label>
                    <input
                      type="password"
                      required
                      placeholder="كلمة المرور الحالية"
                      value={pwdCurrent}
                      onChange={(e) => setPwdCurrent(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{t.passwordPlaceholder}</label>
                    <input
                      type="password"
                      required
                      placeholder="كلمة المرور الجديدة"
                      value={pwdNew}
                      onChange={(e) => setPwdNew(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs px-3 py-2.5 rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(false)}
                      className="px-4 py-2 text-xs bg-white hover:bg-slate-50 text-slate-500 hover:text-white rounded-lg border border-slate-300 transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs bg-[#2563EB] hover:bg-blue-750 text-white font-bold rounded-lg transition-all shadow-sm cursor-pointer"
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
      </div>
    </div>
  );
}
