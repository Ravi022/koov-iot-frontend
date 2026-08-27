// "use client"

// import { useState } from "react"
// import InputField from "../components/input-field"
// import AddItemsButton from "../components/add-items"
// import ItemsTable from "./ItemsTable"

// export default function RejectionForm() {
//   const [materialCode, setMaterialCode] = useState("")
//   const [pieces, setPieces] = useState("")
//   const [totalPieces, setTotalPieces] = useState("")
//   const [items, setItems] = useState([])

//   const handleAdd = () => {
//     if (materialCode && pieces) {
//       const newItem = {
//         id: Date.now(),
//         materialCode,
//         pieces,
//       }

//       const updated = [...items, newItem]
//       setItems(updated)

//       const total = updated.reduce((sum, item) => sum + parseInt(item.pieces), 0)
//       setTotalPieces(total.toString())

//       setMaterialCode("")
//       setPieces("")
//     } else {
//       alert("Please fill all required fields in the rejection form")
//     }
//   }

//   return (
//     <>
//       <h2 className="text-xl font-bold mb-4">Rejection:</h2>

//       <div className="grid grid-cols-2 gap-4 mb-4">
//         <InputField label="Material Code:" value={materialCode} onChange={setMaterialCode} />
//         <InputField label="No. of Pieces:" value={pieces} onChange={setPieces} />
//       </div>

//       <InputField label="Total Pieces:" className="mb-4" value={totalPieces} onChange={setTotalPieces} />

//       <div className="flex justify-center mb-4">
//         <AddItemsButton color="blue" onClick={handleAdd}/>
//       </div>

//       {items.length > 0 && (
//         <ItemsTable title="Rejection Items" items={items} />
//       )}
//     </>
//   )
// }


"use client";
import InputField from "@/components/Mes/components/input-field";
import AddItemsButton from "@/components/Mes/components/add-items";
import { toast } from "react-toastify";

export default function RejectionForm({
  rejMaterialCode,
  setRejMaterialCode,
  rejPieces,
  setRejPieces,
  rejTotalPieces,
  setRejTotalPieces,
  rejectionItems,
  setRejectionItems,
}) {
  const handleAddRejectionItem = () => {
    if (rejMaterialCode && rejPieces) {
      const newItem = {
        id: Date.now(),
        materialCode: rejMaterialCode,
        pieces: rejPieces,
      };
      const updated = [...rejectionItems, newItem];
      setRejectionItems(updated);

      const total = updated.reduce((sum, item) => sum + parseInt(item.pieces || "0"), 0);
      setRejTotalPieces(total.toString());
      setRejMaterialCode("");
      setRejPieces("");
    } else {
      toast.error("Please fill all required fields in the rejection form");
    }
  };

  const handleRemove = (id) => {
    const updated = rejectionItems.filter(item => item.id !== id);
    setRejectionItems(updated);
    const total = updated.reduce((sum, item) => sum + parseInt(item.pieces || "0"), 0);
    setRejTotalPieces(total.toString());
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rejection:</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <InputField label="Material Code:" value={rejMaterialCode} onChange={setRejMaterialCode} />
        <InputField type="number" label="No. of Pieces:" value={rejPieces} onChange={setRejPieces} />
      </div>

      <InputField label="Total Pieces:" value={rejTotalPieces} onChange={setRejTotalPieces} />

      <div className="flex justify-center my-4">
        <AddItemsButton color="blue" onClick={handleAddRejectionItem} />
      </div>

      {rejectionItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Rejection Items:</h3>
          <div className="bg-white bg-opacity-70 rounded-lg p-2">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Material</th>
                  <th className="text-left py-1">Pieces</th>
                </tr>
              </thead>
              <tbody>
                {rejectionItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-1">{item.materialCode}</td>
                    <td className="py-1">{item.pieces}</td>
                    <td className="py-1">
                      <button
                        title="remove item"
                        onClick={() => handleRemove(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
