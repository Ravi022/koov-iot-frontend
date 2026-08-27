"use client";
import Header from "@/components/Header/Header";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute.js";
import PurchaseOrderPage from "@/components/PurchaseOrder/PurchaseOrderPage";

export default function PurchaseOrder() {
  return (
    <ProtectedRoute>
      <div className="max-h-full w-full">
        <Header />
        <PurchaseOrderPage />
      </div>
    </ProtectedRoute>
  );
}
