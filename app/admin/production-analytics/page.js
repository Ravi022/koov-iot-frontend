"use client";
import React from "react";
import Header from "@/components/Header/Header";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import ProductionAnalyticsDashboard from "@/components/Admin/ProductionAnalyticsDashboard";

export default function ProductionAnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-l from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-foreground">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <ProductionAnalyticsDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
}
