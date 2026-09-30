"use client";
import { colorMap, textureMap, materialCodeForProduction } from "@/app/constant";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

// ─── Safe math evaluator (same as InputField) ───────────────────────────────
function evalMath(expr) {
  const s = String(expr).replace(/\s/g, "");
  if (!/^[\d+\-*/().]+$/.test(s) || !/\d/.test(s)) return null;
  try {
    const r = new Function(`"use strict"; return (${s});`)();
    return typeof r === "number" && isFinite(r) ? parseFloat(r.toFixed(4)) : null;
  } catch { return null; }
}

// ─── Inline math-capable number input (mirrors InputField for number type) ───
function NumInput({ value, onChange, placeholder }) {
  const [localVal, setLocalVal] = useState(String(value ?? ""));
  useEffect(() => { setLocalVal(String(value ?? "")); }, [value]);

  const hasExpr = /[+\-*/]/.test(String(localVal).replace(/^-/, ""));

  const handleChange = (e) => {
    const v = e.target.value;
    setLocalVal(v);
    if (!/[+\-*/]/.test(v.replace(/^-/, ""))) {
      if (onChange) onChange(v);
    }
  };

  const commit = () => {
    if (hasExpr) {
      const result = evalMath(localVal);
      if (result !== null) {
        const str = String(result);
        setLocalVal(str);
        if (onChange) onChange(str);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={localVal}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={commit}
      onFocus={(e) => e.target.addEventListener("wheel", (ev) => ev.preventDefault(), { passive: false })}
      className={`w-full h-9 bg-gray-200 rounded px-2 text-sm
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
        ${hasExpr ? "ring-2 ring-blue-400 bg-blue-50" : ""}`}
    />
  );
}

// ─── Shared select style (mirrors InputField label + gray-200 bg) ────────────
const selectCls = "w-full h-9 bg-gray-200 rounded px-2 text-sm";
const labelCls = "block text-sm font-medium mb-1";

export default function ProductionForm({
  materialCode,
  setMaterialCode,
  pieces,
  setPieces,
  productionInKg,
  setProductionInKg,
  totalPieces,
  setTotalPieces,
  totalProductionInKg,
  setTotalProductionInKg,
  productionItems,
  setProductionItems,
}) {

  const [mil, setMil] = useState("");
  const [color, setColor] = useState("");
  const [texture, setTexture] = useState("FT");

  // Find the real material code — handles both GLOVES and GLOVE prefixes
  const findCode = (m, size, t, c) => {
    const withS = `GLOVES${m}${size}${t}${c}01`;
    const withoutS = `GLOVE${m}${size}${t}${c}01`;
    if (materialCodeForProduction.includes(withS)) return withS;
    if (materialCodeForProduction.includes(withoutS)) return withoutS;
    return withS; // fallback — show the code even if not in list yet
  };

  const generateTable = (m, c, t) => {
    const sizes = ["B", "C", "D", "E"]; // Small → Extra Large
    const newItems = sizes.map((size, index) => ({
      id: Date.now() + index,
      materialCode: findCode(m, size, t, c),
      pieces: "",
      productionInKg: "",
    }));
    setProductionItems(newItems);
    setTotalPieces("0");
    setTotalProductionInKg("0.00");
  };

  const handleMilChange = (e) => { const v = e.target.value; setMil(v); if (v && color && texture) generateTable(v, color, texture); };
  const handleColorChange = (e) => { const v = e.target.value; setColor(v); if (mil && v && texture) generateTable(mil, v, texture); };
  const handleTextureChange = (e) => { const v = e.target.value; setTexture(v); if (mil && color && v) generateTable(mil, color, v); };

  const recalcTotals = (updated) => {
    const totalPcs = updated.reduce((s, i) => s + (Number(i.pieces) || 0), 0);
    const totalKg = updated.reduce((s, i) => s + (Number(i.productionInKg) || 0), 0);
    setTotalPieces(totalPcs.toString());
    setTotalProductionInKg(totalKg.toFixed(2).toString());
  };

  const handleItemChange = (id, field, value) => {
    // Store as Number so the payload always sends numeric values
    const numVal = value === "" ? "" : Number(value);
    const updated = productionItems.map(item =>
      item.id === id ? { ...item, [field]: numVal } : item
    );
    setProductionItems(updated);
    recalcTotals(updated);
  };

  const handleRemove = (id) => {
    const updated = productionItems.filter(item => item.id !== id);
    setProductionItems(updated);
    recalcTotals(updated);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-8">Production:</h2>

      {/* ── Selects ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className={labelCls}>Mil</label>
          <select className={selectCls} value={mil} onChange={handleMilChange}>
            <option value="">Select Mil</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Color</label>
          <select className={selectCls} value={color} onChange={handleColorChange}>
            <option value="">Select Color</option>
            {Object.entries(colorMap).map(([key, val]) => (
              <option key={key} value={key}>{val}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Texture</label>
          <select className={selectCls} value={texture} onChange={handleTextureChange}>
            <option value="">Select Texture</option>
            {Object.entries(textureMap).map(([key, val]) => (
              <option key={key} value={key}>{val}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Production Items Table ──────────────────────────────────────── */}
      {productionItems.length > 0 && (
        <div className="mb-4 mt-6">
          <h3 className="text-lg font-semibold mb-3">Production Items</h3>

          <div className="bg-white bg-opacity-80 rounded-lg shadow-sm p-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr className="text-left border-b border-gray-300">
                  <th className="py-2 px-3">Material Code</th>
                  <th className="py-2 px-3">Pieces</th>
                  <th className="py-2 px-3">Kg</th>
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {productionItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-2 px-3 font-medium text-xs">{item.materialCode}</td>
                    <td className="py-2 px-3 w-32">
                      <NumInput
                        value={item.pieces}
                        placeholder="Pieces"
                        onChange={(v) => handleItemChange(item.id, "pieces", v)}
                      />
                    </td>
                    <td className="py-2 px-3 w-32">
                      <NumInput
                        value={item.productionInKg}
                        placeholder="Kg"
                        onChange={(v) => handleItemChange(item.id, "productionInKg", v)}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <button
                        title="Remove item"
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-between items-center px-2 text-sm text-gray-700">
            <div>Total Production (Pcs): <span className="font-bold text-base text-gray-900">{totalPieces}</span></div>
            <div>Total Production (Kg): <span className="font-bold text-base text-gray-900">{totalProductionInKg}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
