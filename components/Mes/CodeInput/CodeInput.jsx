
// import { useState } from "react";

import { useState } from "react";



function CodeInput({label="", code ,setCode, codeOptions }) {
  const [filteredCodes, setFilteredCodes] = useState([]);
  // const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    // setSearch(value);
    setCode(value);

    const filtered = codeOptions.filter((code) =>
      code.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCodes(filtered);

    // console.log("codeOption", codeOptions);

    // Remove error while typing
    setError("");
  };

  const handleSelect = (code) => {
    setCode(code);
    // setSearch(code);
    setFilteredCodes([]);
    setError("");
  };

  // const validateInput = () => {
  //   if (search && !codeOptions.includes(search)) {
  //     setErrors(prevError => prevError.materialCode === 'Invalid material code.')
  //     setError("Invalid material code.");
  //   } else {
  //     setError("");
  //   }
  // };

  //   const validateInput = () => {
  //   if (search && !codeOptions.includes(search)) {
  //     console.log("errors", errors)
  //     setErrors(prevErrors => ({
  //       ...prevErrors,
  //       materialCode: "Invalid material code."
  //     }));
  //     setError("Invalid material code.");
  //   } else {
  //     setErrors(prevErrors => ({
  //       ...prevErrors,
  //       materialCode: ""
  //     }));
  //     setError("");
  //   }
  // };


  // const isBgrade = codeOptions.includes(materialCode);

  return (
    <div className="relative">
      <label className="block text-sm font-medium">{label || 'Material Code'}</label>

      {/* Input Box for Search + Manual Entry */}
      <input
        type="text"
        className={`w-full border rounded mt-1 h-9 p-1 bg-gray-200 ${error ? "border-red-500" : "border-gray-300"
          }`}
        value={code}
        onChange={handleSearchChange}
      // onBlur={validateInput} // Validate on blur
      // disabled={isBgrade}
      />

      {/* Dropdown Suggestions */}
      {filteredCodes.length > 0 && (
        <ul className="border mt-1 bg-gray-200 z-30 w-full absolute max-h-40 overflow-y-auto">
          {filteredCodes.map((code, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(code)}
            >
              {code}
            </li>
          ))}
        </ul>
      )}

      {/* Error Message */}
      {/* {errors && <p className="text-red-600 text-sm mt-1">{errors.materialCode}</p>} */}
    </div>
  );
}

export default CodeInput;




