import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sbFetch } from '../supabase';
import KPICards from '../components/KPICards';
import StatsCharts from '../components/StatsCharts';
import Toast from '../components/Toast';
import {
  LogOut,
  UserPlus,
  Users,
  Search,
  Globe,
  Settings2,
  Trash2,
  Lock,
  Edit2,
  CheckCircle,
  Eye,
  Plus,
  X,
  Sparkles,
  Layers,
  ShoppingBag,
  RefreshCw,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

const TRANSLATIONS = {
  ar: {
    superTitle: "لوحة التحكم للمشرف العام",
    superSub: "مراقبة الأداء، وإدارة العملاء وحسابات الـ COD المخصصة",
    logout: "تسجيل الخروج",
    clientsTab: "👥 إدارة العملاء والاشتراكات",
    ordersTab: "📦 مراقبة كافة الطلبيات الواردة",
    addClientTitle: "إضافة عميل جديد للنظام",
    clientID: "معرّف الحساب الفريد (ID)",
    clientName: "اسم العميل المتجر/الشركة",
    clientPass: "كلمة مرور الدخول للعميل",
    save: "حفظ البيانات",
    cancel: "إلغاء",
    createClientBtn: "إنشاء حساب العميل",
    allOrdersCombined: "جميع طلبيات النظام المتكاملة",
    clientsDatabase: "قاعدة بيانات العملاء المتوفرة",
    searchClients: "البحث عن عميل...",
    searchOrders: "البحث في كل الطلبيات...",
    clientAssigned: "العميل المرتبط",
    noClients: "لا يوجد عملاء مضافين بعد.",
    noOrders: "لا توجد طلبيات مسجلة بالنظام بعد.",
    deleteClientConfirm: "⚠️ تحذير: سيؤدي حذف العميل إلى حذف كافة الطلبيات وسجلات الأسعار الخاصة به بشكل نهائي! هل تريد الاستمرار؟",
    deleteOrderConfirm: "هل أنت متأكد من حذف هذه الطلبية نهائياً؟",
    statusAll: "جميع الحالات",
    statusPending: "في الانتظار",
    statusShipped: "تم الشحن",
    statusDelivered: "تم التسليم",
    statusCancelled: "ملغي",
    showCount: "عرض {count} من أصل {total}"
  },
  en: {
    superTitle: "Super Admin Control Center",
    superSub: "Oversee aggregate performance, provision clients & configure COD accounts",
    logout: "Log Out",
    clientsTab: "👥 Manage Clients",
    ordersTab: "📦 Watch All Orders",
    addClientTitle: "Add New Client Account",
    clientID: "Unique Account ID",
    clientName: "Client Business Name",
    clientPass: "Account Password",
    save: "Save Data",
    cancel: "Cancel",
    createClientBtn: "Provision Client",
    allOrdersCombined: "All Combined System Orders",
    clientsDatabase: "Client Database",
    searchClients: "Search clients...",
    searchOrders: "Search across all orders...",
    clientAssigned: "Assigned Client",
    noClients: "No clients provisioned yet.",
    noOrders: "No orders placed in the system yet.",
    deleteClientConfirm: "⚠️ WARNING: Deleting this client will delete all their orders and prices permanently! Continue?",
    deleteOrderConfirm: "Are you sure you want to delete this order permanently?",
    statusAll: "All Statuses",
    statusPending: "Pending",
    statusShipped: "Shipped",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",
    showCount: "Showing {count} of {total}"
  },
  fr: {
    superTitle: "Centre de Contrôle Super Admin",
    superSub: "Performance globale, gestion des clients & comptes de vente COD",
    logout: "Se Déconnecter",
    clientsTab: "👥 Gérer les clients",
    ordersTab: "📦 Surveiller toutes les commandes",
    addClientTitle: "Ajouter un compte client",
    clientID: "ID unique de compte",
    clientName: "Nom commercial du client",
    clientPass: "Mot de passe d'accès",
    save: "Enregistrer",
    cancel: "Annuler",
    createClientBtn: "Créer le client",
    allOrdersCombined: "Toutes les commandes du système",
    clientsDatabase: "Base commerciale des clients",
    searchClients: "Rechercher un client...",
    searchOrders: "Rechercher dans toutes les commandes...",
    clientAssigned: "Client affecté",
    noClients: "Aucun client enregistré pour l'instant.",
    noOrders: "Aucune commande dans le système.",
    deleteClientConfirm: "⚠️ ATTENTION: Supprimer ce client effacera irrévocablement toutes ses commandes et tarifs associés ! Continuer ?",
    deleteOrderConfirm: "Êtes-vous sûr de vouloir supprimer définitivement cette commande ?",
    statusAll: "Tous les statuts",
    statusPending: "En attente",
    statusShipped: "Expédié",
    statusDelivered: "Livré",
    statusCancelled: "Annulé",
    showCount: "Affichage de {count} sur {total}"
  }
};

export default function SuperAdminPanel() {
  const navigate = useNavigate();

  // Check login state
  useEffect(() => {
    const isSuperAuthed = sessionStorage.getItem("super_authed") === "true";
    if (!isSuperAuthed) {
      navigate('/');
    }
  }, []);

  // Language state
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("super_lang") || "ar";
  });
  const t = TRANSLATIONS[lang];
  const isRtl = lang === "ar";

  // Navigation tabs between "clients" and "orders"
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' | 'orders'

  // DB Data
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filters
  const [clientSearch, setClientSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [newClient, setNewClient] = useState({
    id: '',
    name: '',
    password: ''
  });

  // Client Edit Form Draft (inline or simple modal)
  const [editingClient, setEditingClient] = useState(null);

  // Fetch all system data
  const loadSystemData = async () => {
    setLoading(true);
    try {
      // Fetch clients
      const clientsData = await sbFetch('clients?order=created_at.desc');
      setClients(clientsData || []);

      // Fetch all orders from all clients combined
      const ordersData = await sbFetch('orders?order=created_at.desc');
      setOrders(ordersData || []);

      // Fetch all prices
      const pricesData = await sbFetch('prices');
      setPrices(pricesData || []);
    } catch (err) {
      console.error("Error loaded superadmin data:", err);
      showNotification("فشل تحميل البيانات من قاعدة البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
  };

  // Language switch
  const handleLangToggle = (newLang) => {
    setLang(newLang);
    localStorage.setItem("super_lang", newLang);
  };

  // Add client submit
  const handleAddClientSubmit = async (e) => {
    e.preventDefault();
    const idClean = newClient.id.trim().toLowerCase();
    const nameClean = newClient.name.trim();
    const passClean = newClient.password.trim();

    if (!idClean || !nameClean || !passClean) {
      showNotification("يرجى ملء جميع الحقول المطلوبة لتسجيل الحساب", "error");
      return;
    }

    try {
      // Check if client ID already exists
      const existing = clients.find(c => c.id === idClean);
      if (existing) {
        showNotification("⚠️ معرّف الحساب هذا مستخدم بالفعل من قبل عميل آخر", "error");
        return;
      }

      const response = await sbFetch("clients", {
        method: "POST",
        body: JSON.stringify({
          id: idClean,
          name: nameClean,
          password: passClean
        })
      });

      if (response) {
        showNotification("👑 تم إنشاء لوحة تحكم للعميل الجديد بنجاح", "success");
        setIsAddClientOpen(false);
        setNewClient({ id: '', name: '', password: '' });
        loadSystemData();
      }
    } catch (err) {
      console.error(err);
      showNotification("حدث خطأ أثناء حفظ حساب العميل", "error");
    }
  };

  // Delete Client completely (RLS and foreign key references)
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm(t.deleteClientConfirm)) return;

    try {
      // 1. Delete prices of client
      await sbFetch(`prices?client_id=eq.${clientId}`, { method: "DELETE" });

      // 2. Delete orders of client
      await sbFetch(`orders?client_id=eq.${clientId}`, { method: "DELETE" });

      // 3. Delete client profile
      await sbFetch(`clients?id=eq.${clientId}`, { method: "DELETE" });

      showNotification("🗑️ تم حذف العميل وكافة سجلاته نهائياً من النظام", "grey");
      loadSystemData();
    } catch (err) {
      console.error(err);
      showNotification("فشل إتمام عملية الحذف للعميل", "error");
    }
  };



  // Quick Inline Password Update for a client
  const handleSaveClientEdit = async (e) => {
    e.preventDefault();
    if (!editingClient.name.trim() || !editingClient.password.trim()) {
      showNotification("الحقول لا يمكن أن تكون فارغة", "error");
      return;
    }

    try {
      await sbFetch(`clients?id=eq.${editingClient.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingClient.name.trim(),
          password: editingClient.password.trim()
        })
      });
      showNotification("✅ تم تحديث بيانات اعتماد العميل المختار", "success");
      setEditingClient(null);
      loadSystemData();
    } catch (err) {
      console.error(err);
      showNotification("حدث خطأ أثناء التحديث يرجى المحاولة لاحقاً", "error");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  // Filters logic
  const filteredClients = clients.filter(c => {
    const text = clientSearch.toLowerCase();
    return c.name?.toLowerCase().includes(text) || c.id?.toLowerCase().includes(text);
  });

  const filteredOrders = orders.filter(o => {
    const text = orderSearch.toLowerCase();
    const matchesSearch = 
      o.name?.toLowerCase().includes(text) || 
      o.phone?.toLowerCase().includes(text) || 
      o.product_name?.toLowerCase().includes(text) ||
      o.client_id?.toLowerCase().includes(text);

    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 selection:bg-amber-500/30 selection:text-amber-100 font-sans"
      dir={isRtl ? "rtl" : "ltr"}
      id="super-admin-layout"
    >
      {/* HEADER CONTROL BAR */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5" id="super-header">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-amber-600 to-amber-500 p-2.5 rounded-2xl shadow-md shrink-0 ring-4 ring-amber-500/10 animate-pulse">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-white">
                {t.superTitle}
              </h1>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
                مشرف النظام
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{t.superSub}</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Languages Dropdown/Toggle Group */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5" id="lang-switch-group-super">
            <button 
              onClick={() => handleLangToggle('ar')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'ar' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              عربي
            </button>
            <button 
              onClick={() => handleLangToggle('fr')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'fr' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Fr
            </button>
            <button 
              onClick={() => handleLangToggle('en')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              En
            </button>
          </div>

          <button 
            onClick={loadSystemData}
            className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl transition-all"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-rose-950/20"
            id="super-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </header>

      {/* SYSTEM AGGREGATE STATS (COMBINED ALL CUSTOMERS) */}
      <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">📊 إجمالي نشاط النظام التراكمي (كافة العملاء):</h3>
      <KPICards orders={orders} prices={prices} />

      {/* REVENUE CHARTS BY PLATFORM COMBINED */}
      <StatsCharts orders={orders} prices={prices} />

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6 pb-px" id="tabs-navigation">
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-5 py-3 text-xs font-bold transition-all relative ${
            activeTab === 'clients' 
              ? 'text-amber-400 font-extrabold border-b-2 border-amber-500' 
              : 'text-slate-400 hover:text-white'
          }`}
          id="clients-tab-btn"
        >
          {t.clientsTab}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs font-bold transition-all relative ${
            activeTab === 'orders' 
              ? 'text-amber-400 font-extrabold border-b-2 border-amber-500' 
              : 'text-slate-400 hover:text-white'
          }`}
          id="orders-tab-btn"
        >
          {t.ordersTab}
        </button>
      </div>

      {/* TAB A: CLIENTS DATABASE MANAGEMENT */}
      {activeTab === 'clients' && (
        <div className="space-y-6" id="super-clients-tab">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-850">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>{t.clientsDatabase}</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">تتبع وإضافة حسابات العملاء الذين يحق لهم الوصول واستخدام لوحات التحكم المخصصة للمبيعات والـ COD.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute right-3 top-2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder={t.searchClients}
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs pr-8 pl-4 py-1.5 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={() => setIsAddClientOpen(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
                  id="add-client-modal-open-btn"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.addClientTitle}</span>
                </button>
              </div>
            </div>

            {/* Clients List grid */}
            {filteredClients.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">{t.noClients}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="clients-grids">
                {filteredClients.map((client) => {
                  const clientOrdersCount = orders.filter(o => o.client_id === client.id).length;
                  return (
                    <div 
                      key={client.id} 
                      className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 hover:border-amber-500/20 transition-all shadow-inner relative"
                      id={`client-card-${client.id}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <h5 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                            {client.name}
                            <span className="text-[9px] font-mono text-slate-500">({client.id})</span>
                          </h5>
                          <p className="text-[10px] text-slate-500 mt-1">
                            سجل الطلبات: <span className="text-amber-400 font-bold">{clientOrdersCount}</span> طلبيات
                          </p>
                        </div>
                      </div>

                      {/* Display passwords or Credentials editing */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 text-[11px]">رمز الوصول للعميل</span>
                          <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-500 border border-slate-800/80 select-all font-bold">
                            {client.password}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 mt-4 pt-3.5 border-t border-slate-800/40">
                        <button
                          onClick={() => setEditingClient(client)}
                          className="px-2.5 py-1 text-[10.5px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>تعديل بيانات الحساب</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1.5 bg-slate-950 hover:bg-red-950/20 hover:text-red-400 border border-slate-850 hover:border-red-900/30 text-slate-500 rounded-lg transition-colors cursor-pointer"
                          title="حذف هذا الحساب نهائياً"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB B: WATCH ALL COMBINED ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl" id="super-orders-tab">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{t.allOrdersCombined}</span>
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">سجل مراقبة كامل للطلبات والتحويل المالي لكل العملاء المسجلين حالياً بالنظام بشكل حي وتلقائي.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder={t.searchOrders}
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs px-10 py-2.5 rounded-xl w-full focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-right text-slate-200"
                />
              </div>

              {/* Status Filter */}
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl focus:outline-none text-slate-300 min-w-[120px]"
              >
                <option value="all">🔍 {t.statusAll}</option>
                <option value="pending">⏳ {t.statusPending}</option>
                <option value="shipped">📦 {t.statusShipped}</option>
                <option value="delivered">✅ {t.statusDelivered}</option>
                <option value="cancelled">❌ {t.statusCancelled}</option>
              </select>
            </div>
          </div>

          {/* Table of Orders */}
          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 px-4">
                <p className="text-slate-400 text-sm font-semibold mb-1">{t.noOrders}</p>
                <p className="text-slate-600 text-xs">سجل نشاط النظام فارغ.</p>
              </div>
            ) : (
              <table className="w-full text-right" id="super-orders-table">
                <thead>
                  <tr className="bg-slate-800/40 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                    <th className="p-4 text-right font-bold">{t.customer}</th>
                    <th className="p-4 text-right font-bold">{t.clientAssigned}</th>
                    <th className="p-4 text-right font-bold">{t.wilaya}</th>
                    <th className="p-4 text-right font-bold">{t.productSize}</th>
                    <th className="p-4 text-center font-bold">{t.qty}</th>
                    <th className="p-4 text-right font-bold">نوع المنتج / الموديل</th>
                    <th className="p-4 text-center font-bold">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-800/40">
                  {filteredOrders.map((order, idx) => {
                    const clientObj = clients.find(c => c.id === order.client_id);
                    return (
                      <tr key={order.id || idx} className="hover:bg-slate-850/30 transition-colors">
                        {/* Customer */}
                        <td className="p-4">
                          <div className="font-bold text-slate-100">{order.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{order.phone}</div>
                        </td>

                        {/* Client assigned identifier */}
                        <td className="p-4">
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/10">
                            {clientObj ? clientObj.name : order.client_id}
                          </span>
                        </td>

                        {/* City / Wilaya */}
                        <td className="p-4 text-slate-300 font-medium">{order.city || "الجزائر"}</td>

                        {/* Product */}
                        <td className="p-4">
                          <span className="font-medium text-slate-200">{order.product_name}</span>
                          {order.size && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded-md mr-1.5">{order.size}</span>
                          )}
                        </td>

                        {/* Qty */}
                        <td className="p-4 text-center font-mono font-bold text-slate-100">{order.quantity || 1}</td>

                        {/* Add campaign source */}
                        <td className="p-4">
                          <span className="text-slate-400 bg-slate-950 border border-slate-850 px-2 py-1 rounded-lg">
                            {order.source || "غير معروف"}
                          </span>
                        </td>

                        {/* Status Label */}
                        <td className="p-4 text-center">
                          <span className={`text-[10.5px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wide inline-block ${
                            order.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : order.status === 'shipped'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-705'
                          }`}>
                            {order.status === 'delivered' && "✓ "}
                            {order.status === 'pending' ? t.statusPending : 
                             order.status === 'shipped' ? t.statusShipped : 
                             order.status === 'delivered' ? t.statusDelivered : 
                             order.status === 'cancelled' ? t.statusCancelled : order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD CLIENT ACCOUNT CODES */}
      {isAddClientOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          id="add-client-modal-backdrop"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl">
            <button 
              onClick={() => setIsAddClientOpen(false)}
              className="absolute top-4 left-4 p-1.5 bg-slate-950 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-500" />
              <span>{t.addClientTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">سجل تفاصيل الحساب وكلمة المرور لعميل الـ COD ليتمكن من الولوج للوحة البيانات الخاصة به.</p>

            <form onSubmit={handleAddClientSubmit} className="space-y-4" id="add-client-modal-form">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.clientID} *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: amourshop (أحرف صغيرة فقط)"
                  value={newClient.id}
                  onChange={(e) => setNewClient({...newClient, id: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-xs px-3.5 py-3 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.clientName} *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: متجر Amour Shop"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-xs px-3.5 py-3 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.clientPass} *</label>
                <input
                  type="text"
                  required
                  placeholder="عّين كلمة مرور سهلة لحساب العميل"
                  value={newClient.password}
                  onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-xs px-3.5 py-3 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>



              <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="px-4 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  id="submit-client-provision-btn"
                >
                  {t.createClientBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CLIENT INFO DIALOG */}
      {editingClient && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          id="edit-client-modal"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 sm:p-8 relative shadow-2xl">
            <button 
              onClick={() => setEditingClient(null)}
              className="absolute top-4 left-4 p-1.5 bg-slate-950 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-500" />
              <span>تحديث بيانات العميل: {editingClient.id}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">يمكنك تغيير الاسم التجاري أو تعيين كلمة مرور جديدة لهذا العميل مباشرة.</p>

            <form onSubmit={handleSaveClientEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم العميل</label>
                <input
                  type="text"
                  required
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة مرور العميل</label>
                <input
                  type="text"
                  required
                  value={editingClient.password}
                  onChange={(e) => setEditingClient({...editingClient, password: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-slate-405 hover:text-white rounded-xl border border-slate-800/80 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
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
