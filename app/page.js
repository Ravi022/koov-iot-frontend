// test
"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header/Header";
import UserDashboard from "@/components/User/UserDashboard.js";
import OrderForm from "@/components/OrderForm/OrderForm";
import Loading from "./loading";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute.js";

export default function page() {
  return (
    <ProtectedRoute>
      <div className=" max-h-full w-full ">
        <Header />
        <UserDashboard />
        {/* <Loading /> */}
        {/* <OrderForm /> */}
      </div>
    </ProtectedRoute>
  );
}
