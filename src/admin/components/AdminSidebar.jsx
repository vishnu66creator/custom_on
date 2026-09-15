import React from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  PlusCircle,
  ShoppingBag,
  Sparkles,
  FolderTree,
  CreditCard,
  MessageSquare,
  Ticket,
  BarChart3,
  Bell,
  Settings,
  Store,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users & Customers", icon: Users },
  { id: "products", label: "Product Catalog", icon: Package },
  { id: "add-product", label: "Add Product", icon: PlusCircle },
  { id: "orders", label: "Orders & Fulfillment", icon: ShoppingBag },
  { id: "custom-designs", label: "Custom Designs", icon: Sparkles },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "payments", label: "Payments & Invoices", icon: CreditCard },
  { id: "reviews", label: "Reviews & Ratings", icon: MessageSquare },
  { id: "coupons", label: "Coupons & Discounts", icon: Ticket },
  { id: "analytics", label: "Analytics & Sales", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Store Settings", icon: Settings },
];

export function AdminSidebar({ activeTab, onSelectTab }) {
  const { logout } = useAuth();
  const [scrollPercent, setScrollPercent] = React.useState(0);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const maxScroll = scrollHeight - clientHeight;
    setIsScrolled(scrollTop > 8);
    if (maxScroll > 0) {
      setScrollPercent(Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)));
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-[#09090b] border-r border-white/10 flex flex-col h-screen sticky top-0 text-white select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10 relative">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-black tracking-tight hover:opacity-80 transition">
          <img src="/logo.png" alt="Custom On Logo" className="h-7 w-7 object-contain drop-shadow" />
          <span>CUSTOM<span className="text-brand-orange">ON</span></span>
        </Link>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-brand-orange/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-brand-orange border border-brand-orange/20">
          <Shield className="h-2.5 w-2.5" /> Admin
        </span>

        {/* Dynamic Scroll Indicator Line */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-brand-orange to-amber-400 transition-all duration-150 ease-out z-20"
          style={{ width: `${scrollPercent}%`, opacity: isScrolled ? 1 : 0 }}
        />
      </div>

      {/* Navigation List with Sleek Dark Custom Scrollbar */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-1 admin-custom-scrollbar"
      >
        <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
          <span>Management</span>
          {isScrolled && (
            <span className="text-[9px] font-mono text-brand-orange/80 font-normal">
              {Math.round(scrollPercent)}%
            </span>
          )}
        </div>

        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group ${
                isActive
                  ? "bg-brand-orange text-white shadow-brand"
                  : "text-white/70 hover:bg-white/5 hover:text-white hover:translate-x-1"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                  isActive ? "text-white" : "text-white/50 group-hover:text-brand-orange"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer / Store Link & Logout */}
      <div className="p-3 border-t border-white/10 space-y-1 bg-[#09090b]/80 backdrop-blur-sm z-20">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white transition"
        >
          <Store className="h-4 w-4 shrink-0 text-white/40" />
          <span>View Live Store (5173)</span>
        </a>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 transition cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

