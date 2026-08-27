"use client"

import { useState, useEffect } from "react"

// Safe math evaluator — only allows digits, +, -, *, /, ., (, )
function evalMath(expr) {
  const s = expr.replace(/\s/g, "");
  if (!/^[\d+\-*/().]+$/.test(s) || !/\d/.test(s)) return null;
  try {
    const r = new Function(`"use strict"; return (${s});`)();
    return typeof r === "number" && isFinite(r) ? parseFloat(r.toFixed(4)) : null;
  } catch { return null; }
}

export default function InputField({ label, type = "text", disabled = false, className = "", value = "", onChange, readOnly, error }) {
  const isNumType = type === "number" || type === "Number";
  const [localVal, setLocalVal] = useState(String(value));

  // Keep local value in sync when parent changes value (e.g. form reset)
  useEffect(() => { setLocalVal(String(value)); }, [value]);

  // Check if current text has a math operator (ignore leading minus)
  const hasExpr = isNumType && /[+\-*/]/.test(String(localVal).replace(/^-/, ""));

  const handleChange = (e) => {
    const v = e.target.value;
    if (isNumType) {
      setLocalVal(v);
      // Pass plain numbers to parent immediately; hold expressions until Enter
      if (!/[+\-*/]/.test(v.replace(/^-/, ""))) {
        if (onChange) onChange(v);
      }
    } else {
      if (onChange) onChange(v);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isNumType && hasExpr) {
      e.preventDefault();
      const result = evalMath(localVal);
      if (result !== null) {
        const str = String(result);
        setLocalVal(str);
        if (onChange) onChange(str);
      }
    }
  }

  const handleBlur = () => {
    if (isNumType && hasExpr) {
      const result = evalMath(localVal);
      if (result !== null) {
        const str = String(result);
        setLocalVal(str);
        if (onChange) onChange(str);
      }
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input readOnly={readOnly}
        type={isNumType ? "text" : type}
        inputMode={isNumType ? "decimal" : undefined}
        value={isNumType ? localVal : value}
        disabled={disabled}
        onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`w-full h-9 bg-gray-200 rounded px-2
       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
       ${hasExpr ? "ring-2 ring-blue-400 bg-blue-50" : ""}`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}



// "use client"

// import { useRef, useEffect } from "react";

// export default function InputField({
//   label,
//   type = "text",
//   disabled = false,
//   className = "",
//   value = "",
//   onChange,
//   readOnly,
//   error,
// }) {
//   const inputRef = useRef(null);

//   const handleChange = (e) => {
//     if (onChange) {
//       onChange(e.target.value);
//     }
//   };

//   useEffect(() => {
//     const input = inputRef.current;

//     if (type === "number" && input) {
//       const handleWheel = (e) => e.preventDefault();
//       input.addEventListener("wheel", handleWheel, { passive: false });

//       return () => {
//         input.removeEventListener("wheel", handleWheel);
//       };
//     }
//   }, [type]);

//   return (
//     <div className={className}>
//       <label className="block text-sm font-medium mb-1">{label}</label>
//       <input
//         ref={inputRef}
//         readOnly={readOnly}
//         type={type}
//         value={value}
//         disabled={disabled}
//         onChange={handleChange}
//         className={`w-full h-9 bg-gray-200 rounded px-2 ${
//           type === "number"
//             ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//             : ""
//         }`}
//       />
//       {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
//     </div>
//   );
// }
