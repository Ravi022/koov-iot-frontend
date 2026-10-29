"use client";
import React from "react";
import Header from "@/components/Header/Header";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import DowntimeAnalyticsDashboard from "@/components/Admin/DowntimeAnalyticsDashboard";

export default function DowntimeAnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-150 to-slate-200 text-foreground">
        <Header />
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <DowntimeAnalyticsDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
}
