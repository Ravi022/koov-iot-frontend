"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Pagination from "@/components/ui/pagination";
import {
  ClipboardList,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
  Trash2,
  X,
  FileText,
  IndianRupee,
  Package,
  RotateCcw,
  Save,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const RELEASE_STATES = ["Blocked", "Released", "Partially Released"];
const ORDER_UNITS = ["PCS", "KG", "MTR", "LTR", "BOX", "SET"];
const CURRENCIES = ["INR", "USD", "EUR"];

const INITIAL_FORM = {
  purchasingDocNo: "",
  releaseState: "",
  supplier: "",
  item: "",
  material: "",
  materialDescription: "",
  orderQuantity: "",
  orderUnit: "",
  netPrice: "",
  netOrderValue: "",
  currency: "INR",
  stillToBeDelivered: "",
};

const COLUMNS = [
  { key: "purchasingDocNo", label: "PO Doc No" },
  { key: "releaseState", label: "Release State" },
  { key: "supplier", label: "Supplier / Plant" },
  { key: "item", label: "Item" },
  { key: "material", label: "Material" },
  { key: "materialDescription", label: "Description" },
  { key: "orderQuantity", label: "Order Qty", numeric: true },
  { key: "orderUnit", label: "Unit" },
  { key: "netPrice", label: "Net Price", numeric: true },
  { key: "netOrderValue", label: "Net Value", numeric: true, highlight: true },
  { key: "currency", label: "Currency" },
  { key: "stillToBeDelivered", label: "To Deliver", numeric: true },
];

// ─── Reusable Field Components ────────────────────────────────────────────────

function FormField({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150";

const selectClass =
  "w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 appearance-none cursor-pointer";

const readOnlyClass =
  "w-full h-10 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 cursor-default";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PurchaseOrderPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const itemsPerPage = 10;

  // ── Form handlers ───────────────────────────────────────────────────────────

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };

    // Auto-calculate Net Order Value
    if (field === "orderQuantity" || field === "netPrice") {
      const qty = parseFloat(field === "orderQuantity" ? value : updated.orderQuantity) || 0;
      const price = parseFloat(field === "netPrice" ? value : updated.netPrice) || 0;
      updated.netOrderValue = (qty * price).toFixed(2);
    }

    setForm(updated);
  };

  const handleSave = () => {
    if (!form.purchasingDocNo || !form.supplier) return;

    if (editingId !== null) {
      setOrders((prev) =>
        prev.map((o) => (o.id === editingId ? { ...form, id: editingId } : o))
      );
      setEditingId(null);
    } else {
      setOrders((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    setForm(INITIAL_FORM);
  };

  const handleReset = () => setForm(INITIAL_FORM);

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const handleEdit = (order) => {
    setViewOrder(null);
    setDeleteConfirm(null);
    setForm(order);
    setEditingId(order.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setDeleteConfirm(null);
  };

  // ── Filtering, sorting, pagination ──────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.purchasingDocNo.toLowerCase().includes(q) ||
          o.supplier.toLowerCase().includes(q) ||
          o.material.toLowerCase().includes(q) ||
          o.materialDescription.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, searchQuery]);

  const sortedOrders = useMemo(() => {
    if (!sortConfig.key) return filteredOrders;
    const sorted = [...filteredOrders].sort((a, b) => {
      const col = COLUMNS.find((c) => c.key === sortConfig.key);
      let aVal = a[sortConfig.key] ?? "";
      let bVal = b[sortConfig.key] ?? "";
      if (col?.numeric) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }
      if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredOrders, sortConfig]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentItems = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortConfig.dir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600" />
    );
  };

  // ── Stats ───────────────────────────────────────────────────────────────────

  const totalValue = useMemo(
    () => orders.reduce((sum, o) => sum + (parseFloat(o.netOrderValue) || 0), 0),
    [orders]
  );

  // ── Currency formatter ──────────────────────────────────────────────────────

  const formatCurrency = (val, currency = "INR") => {
    const num = parseFloat(val) || 0;
    if (currency === "INR") return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    if (currency === "USD") return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    if (currency === "EUR") return `€${num.toLocaleString("en-DE", { minimumFractionDigits: 2 })}`;
    return num.toFixed(2);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <ClipboardList className="w-7 h-7 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
              <p className="text-sm text-gray-500">Create and manage purchase orders</p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">{orders.length}</span>
              <span className="text-xs text-gray-400">Orders</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 shadow-sm">
              <IndianRupee className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700">
                {totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400">Total Value</span>
            </div>
          </div>
        </div>

        {/* ── Form Card ── */}
        <Card className="shadow-lg border-t-4 border-t-blue-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <FileText className="w-5 h-5 text-blue-500" />
              {editingId ? "Edit Purchase Order" : "New Purchase Order"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
              {/* Purchasing Document No */}
              <FormField label="Purchasing Document No" required>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. PO-2026-001"
                  value={form.purchasingDocNo}
                  onChange={(e) => handleChange("purchasingDocNo", e.target.value)}
                />
              </FormField>

              {/* Release State */}
              <FormField label="Release State">
                <select
                  className={selectClass}
                  value={form.releaseState}
                  onChange={(e) => handleChange("releaseState", e.target.value)}
                >
                  <option value="">Select State</option>
                  {RELEASE_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </FormField>

              {/* Supplier */}
              <FormField label="Supplier / Supplying Plant" required>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Supplier name or plant"
                  value={form.supplier}
                  onChange={(e) => handleChange("supplier", e.target.value)}
                />
              </FormField>

              {/* Item */}
              <FormField label="Item">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Item code"
                  value={form.item}
                  onChange={(e) => handleChange("item", e.target.value)}
                />
              </FormField>

              {/* Material */}
              <FormField label="Material">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Material code"
                  value={form.material}
                  onChange={(e) => handleChange("material", e.target.value)}
                />
              </FormField>

              {/* Material Description */}
              <FormField label="Material Description">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Description"
                  value={form.materialDescription}
                  onChange={(e) => handleChange("materialDescription", e.target.value)}
                />
              </FormField>

              {/* Order Quantity */}
              <FormField label="Order Quantity">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="0"
                  value={form.orderQuantity}
                  onChange={(e) => handleChange("orderQuantity", e.target.value)}
                />
              </FormField>

              {/* Order Unit */}
              <FormField label="Order Unit">
                <select
                  className={selectClass}
                  value={form.orderUnit}
                  onChange={(e) => handleChange("orderUnit", e.target.value)}
                >
                  <option value="">Select Unit</option>
                  {ORDER_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </FormField>

              {/* Net Price */}
              <FormField label="Net Price">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                  value={form.netPrice}
                  onChange={(e) => handleChange("netPrice", e.target.value)}
                />
              </FormField>

              {/* Net Order Value (auto-calculated) */}
              <FormField label="Net Order Value">
                <input
                  type="text"
                  readOnly
                  className={readOnlyClass}
                  value={form.netOrderValue ? formatCurrency(form.netOrderValue, form.currency) : "Auto-calculated"}
                />
              </FormField>

              {/* Currency */}
              <FormField label="Currency">
                <select
                  className={selectClass}
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>

              {/* Still to be delivered */}
              <FormField label="Still to be Delivered (Qty)">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="0"
                  value={form.stillToBeDelivered}
                  onChange={(e) => handleChange("stillToBeDelivered", e.target.value)}
                />
              </FormField>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
              <Button
                type="button"
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 gap-2"
                disabled={!form.purchasingDocNo || !form.supplier}
              >
                <Save className="w-4 h-4" />
                {editingId ? "Update" : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={handleCancel} className="gap-2 text-gray-500 hover:text-gray-700">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Table Card ── */}
        <Card className="shadow-lg border-t-4 border-t-indigo-500 overflow-hidden">
          <CardHeader className="pb-3 border-b bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg text-gray-800">Purchase Order List</CardTitle>
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search PO, Supplier, Material..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
                <thead className="bg-indigo-50 text-xs uppercase text-indigo-900 sticky top-0 z-10">
                  <tr>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 border-b font-semibold cursor-pointer hover:bg-indigo-100 transition-colors select-none whitespace-nowrap"
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          <SortIcon colKey={col.key} />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 border-b font-semibold text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className="text-center py-16 text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <ClipboardList className="w-10 h-10 text-gray-300" />
                          <p className="text-base font-medium">No purchase orders yet</p>
                          <p className="text-sm">Fill the form above to create one</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((order) => (
                      <tr key={order.id} className="hover:bg-indigo-50/40 transition-colors">
                        {COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className={`px-4 py-3 whitespace-nowrap ${col.numeric ? "text-right font-medium" : ""} ${col.highlight ? "text-emerald-700 font-bold" : ""}`}
                          >
                            {col.highlight
                              ? formatCurrency(order[col.key], order.currency)
                              : col.key === "netPrice"
                              ? formatCurrency(order[col.key], order.currency)
                              : order[col.key] || "—"}
                          </td>
                        ))}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewOrder(order)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(order)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(order)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3 p-4">
              {currentItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium">No purchase orders yet</p>
                </div>
              ) : (
                currentItems.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{order.purchasingDocNo}</p>
                        <p className="text-xs text-gray-500">{order.supplier}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        order.releaseState === "Released"
                          ? "bg-green-100 text-green-700"
                          : order.releaseState === "Blocked"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {order.releaseState || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Material</p>
                        <p className="font-medium text-gray-700">{order.material || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Order Qty</p>
                        <p className="font-medium text-gray-700">{order.orderQuantity || "—"} {order.orderUnit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Net Price</p>
                        <p className="font-medium text-gray-700">{formatCurrency(order.netPrice, order.currency)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Net Order Value</p>
                        <p className="font-bold text-emerald-700">{formatCurrency(order.netOrderValue, order.currency)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Button size="sm" variant="ghost" className="text-xs gap-1 text-blue-600" onClick={() => setViewOrder(order)}>
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs gap-1 text-amber-600" onClick={() => handleEdit(order)}>
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs gap-1 text-red-600" onClick={() => setDeleteConfirm(order)}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-t bg-gray-50/50 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Purchase Order Details
            </DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["PO Doc No", viewOrder.purchasingDocNo],
                ["Release State", viewOrder.releaseState],
                ["Supplier / Plant", viewOrder.supplier],
                ["Item", viewOrder.item],
                ["Material", viewOrder.material],
                ["Description", viewOrder.materialDescription],
                ["Order Qty", `${viewOrder.orderQuantity || "—"} ${viewOrder.orderUnit || ""}`],
                ["Net Price", formatCurrency(viewOrder.netPrice, viewOrder.currency)],
                ["Net Order Value", formatCurrency(viewOrder.netOrderValue, viewOrder.currency)],
                ["Currency", viewOrder.currency],
                ["To Deliver", viewOrder.stillToBeDelivered || "—"],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <p className="text-xs text-gray-400 mb-0.5">{lbl}</p>
                  <p className={`font-medium ${lbl === "Net Order Value" ? "text-emerald-700 font-bold text-base" : "text-gray-800"}`}>
                    {val || "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Purchase Order?</DialogTitle>
          </DialogHeader>
          {deleteConfirm && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>{deleteConfirm.purchasingDocNo}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(deleteConfirm.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
