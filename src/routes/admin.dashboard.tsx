import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminProtectedRoute } from "@/components/admin-protected-route";
import { AdminSidebar } from "@/admin/components/AdminSidebar";
import { AdminHeader } from "@/admin/components/AdminHeader";
import { AdminNavbar } from "@/admin/components/AdminNavbar";
import { DeleteModal } from "@/admin/components/DeleteModal";

// Admin Pages
import { Dashboard } from "@/admin/pages/Dashboard";
import { Users } from "@/admin/pages/Users";
import { Products } from "@/admin/pages/Products";
import { AddProduct } from "@/admin/pages/AddProduct";
import { EditProduct } from "@/admin/pages/EditProduct";
import { Orders } from "@/admin/pages/Orders";
import { OrderDetails } from "@/admin/pages/OrderDetails";
import { Stickers } from "@/admin/pages/Stickers";
import { Fonts } from "@/admin/pages/Fonts";
import { Categories } from "@/admin/pages/Categories";
import { Payments } from "@/admin/pages/Payments";
import { Reviews } from "@/admin/pages/Reviews";
import { Coupons } from "@/admin/pages/Coupons";
import { Analytics } from "@/admin/pages/Analytics";
import { Notifications } from "@/admin/pages/Notifications";

// Hooks
import { useProducts } from "@/admin/hooks/useProducts";
import { useOrders } from "@/admin/hooks/useOrders";
import { useUsers } from "@/admin/hooks/useUsers";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Portal Dashboard — Custom On" },
      {
        name: "description",
        content: "Custom On Central Administration and Store Control Portal.",
      },
    ],
  }),
  component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
  return (
    <AdminProtectedRoute>
      <AdminDashboardLayout />
    </AdminProtectedRoute>
  );
}

function AdminDashboardLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, updateStatus } = useOrders();
  const { users, toggleUserStatus, updateUserRole, refresh: refreshUsers, loading: usersLoading } = useUsers();

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order);
    setActiveTab("order-details");
  };

  const handleEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setActiveTab("edit-product");
  };

  const handleSaveNewProduct = async (prodData: any) => {
    await addProduct(prodData);
    setActiveTab("products");
  };

  const handleSaveEditedProduct = async (id: any, prodData: any) => {
    await updateProduct(id, prodData);
    setEditingProduct(null);
    setActiveTab("products");
  };

  const handleConfirmDeleteProduct = async () => {
    if (deletingProduct) {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  // Render current active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard orders={orders} onSelectTab={setActiveTab} />;
      case "users":
        return (
          <Users
            users={users}
            loading={usersLoading}
            onRefresh={refreshUsers}
            onToggleStatus={toggleUserStatus}
            onUpdateRole={updateUserRole}
          />
        );
      case "products":
        return (
          <Products
            products={products}
            onAddClick={() => setActiveTab("add-product")}
            onEdit={handleEditProduct}
            onDelete={(p: any) => setDeletingProduct(p)}
          />
        );
      case "add-product":
        return (
          <AddProduct
            onBack={() => setActiveTab("products")}
            onSave={handleSaveNewProduct}
          />
        );
      case "edit-product":
        return (
          <EditProduct
            product={editingProduct}
            onBack={() => {
              setEditingProduct(null);
              setActiveTab("products");
            }}
            onSave={handleSaveEditedProduct}
          />
        );
      case "orders":
        return <Orders orders={orders} onSelectOrder={handleSelectOrder} />;
      case "order-details":
        return (
          <OrderDetails
            order={selectedOrder}
            onBack={() => {
              setSelectedOrder(null);
              setActiveTab("orders");
            }}
            onUpdateStatus={updateStatus}
          />
        );
      case "stickers":
        return <Stickers />;
      case "fonts":
        return <Fonts />;
      case "categories":
        return <Categories />;
      case "payments":
        return <Payments />;
      case "reviews":
        return <Reviews />;
      case "coupons":
        return <Coupons />;
      case "analytics":
        return <Analytics />;
      case "notifications":
        return <Notifications />;
      default:
        return <Dashboard orders={orders} onSelectTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0b0d] text-white">
      {/* Left Admin Sidebar */}
      <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title={activeTab.replace("-", " ")} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto admin-custom-scrollbar">
          <AdminNavbar currentTab={activeTab} onSelectTab={setActiveTab} />
          {renderTabContent()}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingProduct)}
        title="Delete Apparel Item"
        message={`Are you sure you want to delete "${deletingProduct?.name}" from your catalog? This cannot be undone.`}
        onConfirm={handleConfirmDeleteProduct}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}
