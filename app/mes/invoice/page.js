"use client"
import { API_BASE_URL } from "@/lib/api";

import { useMemo, useState } from "react"
import InputField from "@/components/Mes/components/input-field"
import AddItemsButton from "@/components/Mes/components/add-items"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import { getNormalizedDate, gradeOptions, materialCodeOptions } from "@/app/constant"
import Header from "@/components/Header/Header"
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/Mes/logout/logoutButton"

export default function InvoicePage() {
  const [date, setDate] = useState("")
  const [invoiceNo, setInvoiceNo] = useState("")
  const [materialCode, setMaterialCode] = useState("Select")
  const [grade, setGrade] = useState("Select")
  const [pieces, setPieces] = useState("")
  const [items, setItems] = useState([])
  const [errors, setErrors] = useState({})
  const [isLoading, setIsloading] = useState(false);

  const validateFields = () => {
    const newErrors = {}
    if (!materialCode || materialCode === "Select") newErrors.materialCode = "Select a material code"
    if (!grade || grade === "Select") newErrors.grade = "Select a grade"
    if (!pieces) newErrors.pieces = "Enter number of pieces"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddItem = () => {
    if (!validateFields()) return
    const newItem = {
      id: Date.now(),
      materialCode,
      grade,
      pieces: parseInt(pieces),
    }
    setItems([...items, newItem])
    setMaterialCode("Select")
    setGrade("Select")
    setPieces("")
    setErrors({})
  }

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleSubmit = async () => {
    if (!date || !invoiceNo || items.length === 0) {
      toast.error("Date, Invoice No, and at least one item are required.")
      return
    }

    setIsloading(true);
    const { year, month, day } = getNormalizedDate(date)
    const token = localStorage.getItem("accessToken")
    //  console.log(token)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/production/invoiceMesData/update`,
        { year, month, day, invoiceNo, items, totalPieces },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // console.log("response", response);

      if (response.status === 200) {
        toast.success("Invoice submitted successfully!")
        setItems([])
        setDate("")
        setInvoiceNo("")
      } else {
        console.log("response", response);
        toast.error("Submission failed.")
      }
    } catch (error) {
      console.error(error.response.data.message);
      toast.error(error.response.data.message);
    }
    finally {
      setIsloading(false);
    }
  }

  const totalPieces = useMemo(() => {
    return items.reduce((sum, item) => sum + item.pieces, 0)
  }, [items])

  const router = useRouter();

  const handleLogout = async () => {
    try {
      // const accessToken = localStorage.getItem("accessToken");
      // console.log("accessToken", accessToken);

      // Make the logout request to the backend
      // const response = await axios.get(
      //   `${API_BASE_URL}/common/logoutUser`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`, // Send token in the header
      //     },
      //   }
      // );


      // Clear tokens or relevant user data from localStorage
      localStorage.removeItem("accessToken");
      // localStorage.removeItem("refreshToken");
      localStorage.removeItem("userDetails");

      // Navigate to the login page
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      // Optionally, handle the error (show a notification, etc.)
    }
  };


  return (
    <><div className="flex justify-end max-w-5xl mx-auto mt-4">
      <div className="absolute top-4 right-4 z-50">
        <LogoutButton />
      </div>
      {/* <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
      >
        Logout
      </button> */}
    </div>
      <div className="mt-10 p-6 sm:p-10 max-w-5xl mx-auto rounded-xl bg-gradient-to-br from-white to-indigo-100 shadow-md">

        <ToastContainer hideProgressBar />
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-8">Invoice Entry</h1>

        {/* Date & Invoice No */}
        <div className="flex justify-between gap-6 mb-6">
          <InputField label="Date" type="date" value={date} onChange={setDate} error={errors.date} />
          <InputField label="Invoice No" value={invoiceNo} onChange={setInvoiceNo} error={errors.invoiceNo} />
        </div>

        {/* Material Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block mb-1 text-sm font-medium">Material Code</label>
            <select
              className="h-10 bg-gray-200 rounded px-2 w-full"
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
            >
              <option value="Select">Select</option>
              {materialCodeOptions.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
            {errors.materialCode && <p className="text-red-500 text-sm">{errors.materialCode}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Grade</label>
            <select
              className="h-10 bg-gray-200 rounded px-2 w-full"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="Select">Select</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {errors.grade && <p className="text-red-500 text-sm">{errors.grade}</p>}
          </div>

          <InputField
            label="No. of Pieces"
            type="number"
            value={pieces}
            onChange={setPieces}
            error={errors.pieces}
          />
        </div>

        {/* Add Button */}
        <div className="flex justify-center mb-6">
          <AddItemsButton onClick={handleAddItem} color="green" />
        </div>

        {/* Item List */}
        {items.length > 0 && (
          <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Invoice Items</h2>
            <div className="bg-white bg-opacity-90 overflow-auto rounded-lg shadow-md pb-4">
              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="border-b bg-indigo-50">
                    <th className="text-left py-2 px-2">Material Code</th>
                    <th className="text-left py-2 px-2">Grade</th>
                    <th className="text-left py-2 px-2">Pieces</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-indigo-100 transition-all">
                      <td className="py-2 px-2">{item.materialCode}</td>
                      <td className="py-2 px-2">{item.grade}</td>
                      <td className="py-2 px-2">{item.pieces}</td>
                      <td className="py-2 px-2">
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right mt-3 font-semibold text-indigo-800">
                Total Pieces: {totalPieces}
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        {items.length > 0 && (
          // <div className="flex justify-end mt-6">
          //   <Button
          //     className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg shadow"
          //     onClick={handleSubmit}
          //   >
          //     Submit Invoice
          //   </Button>
          // </div>
          <div className="text-right mt-6">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
              {isLoading ? 'Submitting...' : 'Submit Invoice'}
            </button>
          </div>
        )}
      </div>
    </>

  )
}
