
"use client"

import { useEffect, useState } from "react"
import InputField from "@/components/Mes/components/input-field"
import AddItemsButton from "@/components/Mes/components/add-items"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, SendToBack, Trash2, Pencil } from "lucide-react"
import { getNormalizedDate, gradeOptions, materialCodeOptions } from "@/app/constant"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import LogoutButton from "@/components/Mes/logout/logoutButton"
import { useRouter } from "next/navigation"
import CodeInput from "@/components/Mes/CodeInput/CodeInput"
import * as XLSX from "xlsx"



// const materialOptions = ["Select", "MAT001", "MAT002", "MAT003"]
// const gradeOptions = ["Select", "A", "B", "Non Moving"]

export default function DispatchPage() {
  const [date, setDate] = useState("")
  const [invoiceNo, setInvoiceNo] = useState("")
  // const [batchId, setBatchId] = useState("")
  const [materialCode, setMaterialCode] = useState("")
  const [grade, setGrade] = useState("")
  const [packagingType, setPackagingType] = useState("Select")
  // const [itemCode, setItemCode] = useState("")
  // const [lotNo, setLotNo] = useState("")
  const [pieces, setPieces] = useState("")
  const [customer, setCustomer] = useState("")
  const [salesOrderNo, setSalesOrderNo] = useState("")
  const [rate, setRate] = useState("")
  const [invoiceAmount, setInvoiceAmount] = useState("")
  const [taxableValueForGST, setTaxableValueForGST] = useState("")
  const [shipToParty, setShipToParty] = useState("")

  const [items, setItems] = useState([])
  const [errors, setErrors] = useState({});
  const [isLoading, setIsloading] = useState(false);
  const [editingId, setEditingId] = useState(null);


  const resetFields = () => {
    // setBatchId("")
    setMaterialCode("")
    setGrade("")
    setPackagingType("Select")
    // setItemCode("")
    // setLotNo("")
    setPieces("")
    setCustomer("")
    setSalesOrderNo("")
    setRate("")
    setInvoiceAmount("")
    setTaxableValueForGST("")
    setShipToParty("")
    setInvoiceNo("")
    setErrors({})
  }

  const validateFields = () => {
    const newErrors = {}
    if (!invoiceNo) newErrors.invoiceNo = "Invoice No is required"
    if (materialCode === "") newErrors.materialCode = "Material code is required"
    else if (!materialCodeOptions.includes(materialCode))
      newErrors.materialCode = "Invalid material code"
    if (grade === "Select") newErrors.grade = "Select a grade"
    if (packagingType === "Select") newErrors.packagingType = "Select a packaging type"
    // if (!itemCode) newErrors.itemCode = "Item code is required"
    // if (!lotNo) newErrors.lotNo = "Lot No is required"
    if (!pieces) newErrors.pieces = "Number of pieces is required"
    if (!customer) newErrors.customer = "Customer is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddItem = () => {
    if (!validateFields()) return

    if (editingId) {
      const updatedItems = items.map(item => item.id === editingId ? {
        ...item, materialCode, grade, packagingType, pieces: parseInt(pieces), customer, invoiceNo, salesOrderNo, rate: Number(rate), invoiceAmount: Number(invoiceAmount), taxableValueForGST: Number(taxableValueForGST), shipToParty
      } : item);
      setItems(updatedItems);
      setEditingId(null);
    } else {
      const newItem = {
        id: Date.now(),
        materialCode,
        grade,
        packagingType,
        pieces: parseInt(pieces),
        customer,
        invoiceNo,
        salesOrderNo,
        rate: Number(rate),
        invoiceAmount: Number(invoiceAmount),
        taxableValueForGST: Number(taxableValueForGST),
        shipToParty
      }
      setItems([...items, newItem])
    }
    resetFields()
  }

  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleEdit = (id) => {
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setMaterialCode(itemToEdit.materialCode);
      setGrade(itemToEdit.grade);
      setPackagingType(itemToEdit.packagingType);
      setPieces(itemToEdit.pieces);
      setCustomer(itemToEdit.customer);
      setInvoiceNo(itemToEdit.invoiceNo || "");
      setSalesOrderNo(itemToEdit.salesOrderNo || "");
      setRate(itemToEdit.rate || "");
      setInvoiceAmount(itemToEdit.invoiceAmount || "");
      setTaxableValueForGST(itemToEdit.taxableValueForGST || "");
      setShipToParty(itemToEdit.shipToParty || "");
      setEditingId(id);
    }
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken")

    if (!date || items.length === 0) {
      toast.error("Please fill Date, and add at least one item.")
      return
    }

    // Validate uploaded items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.materialCode || !item.packagingType || item.packagingType === 'Select' || !item.invoiceNo || !item.customer) {
        toast.error(`Item #${i + 1} is missing required fields (Material, Packaging, Invoice No, or Customer).`);
        return;
      }
    }

    setIsloading(true);

    const { year, month, day } = getNormalizedDate(date);
    try {
      const response = await axios.post('http://127.0.0.1:5001/production/dispachOutMes/update', { year, month, day, items, totalPieces, mtdType: "totaldispatch", invoiceNo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 200) {
        // alert("Dispatch submitted successfully!")
        toast.success("Dispatch submitted successfully!")
        setItems([])
        setDate("")
        resetFields()
      } else {
        toast.error("Failed to submit.")
      }
    } catch (err) {
      console.log(err);
      console.error(err.response.data.message);
      toast.error(err.response.data.message);
    }
    finally {
      setIsloading(false);
    }
  }

  // const handleChangeMcode = (e) => {
  //   const val = e.target.value;
  //   if (val.slice(-2) === '01')
  //     setGrade('A')
  //   else
  //     setGrade('B')
  //   setMaterialCode(val);
  // }

  useEffect(() => {
    if (materialCode) {
      const endWithMaterialCode = materialCode.slice(-2);
      if (endWithMaterialCode === '01' || endWithMaterialCode === '1R')
        setGrade('A');
      else if (endWithMaterialCode === '02')
        setGrade('B');
      else
        setGrade('')
    }
  }, [materialCode])

  const totalPieces = items.reduce((sum, item) => sum + item.pieces, 0)

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      let uploadedItems = data.map((row, index) => {
        const remark = row["Remarks Invoice"] || row["Remark"] || "";
        let pType = "Select";
        if (remark.toUpperCase().includes("BOX") || remark.toUpperCase().includes("OWN BOX")) pType = "Box packing";
        else if (remark.toUpperCase().includes("BULK") || remark.toUpperCase().includes("POLY")) pType = "Poly packing";

        let mCode = row["Material Code"] || "";
        let gradeVal = "";
        if (mCode) {
          const end = mCode.slice(-2);
          if (end === '01' || end === '1R') gradeVal = 'A';
          else if (end === '02') gradeVal = 'B';
        }

        const dateStr = row["Invoice Date"] || row["Date"] || "";

        let shipParty = row["Ship to Party Place"] || row["Ship To Party"] || "";

        // Scan upwards if empty
        if (!shipParty) {
          for (let i = index - 1; i >= 0; i--) {
            const upperVal = data[i]["Ship to Party Place"] || data[i]["Ship To Party"];
            if (upperVal) {
              shipParty = upperVal;
              break;
            }
          }
        }

        shipParty = shipParty.charAt(0).toUpperCase() + shipParty.slice(1).toLowerCase();

        return {
          id: Date.now() + index,
          materialCode: mCode,
          grade: gradeVal,
          packagingType: pType,
          pieces: (Number(row["Quantity"]) || 0),
          customer: row["Billed to Party Name"] || row["Bill To Party"] || "",
          invoiceNo: row["ODN No."] || row["ODN No"] || "",
          salesOrderNo: row["Sales Order"] || "",
          rate: (Number(row["Rate"]) || 0),
          invoiceAmount: (Number(row["Invoice Amount in INR"] || row["Invoice Amount"]) || 0),
          taxableValueForGST: (Number(row["Taxable value for GST"] || row["Taxable Value for GST"]) || 0),
          shipToParty: shipParty,
          dateStr: dateStr // temp field to filter by top date
        };
      });

      // Filter out zero quantities and missing material code or invoice no
      uploadedItems = uploadedItems.filter(item => item.pieces !== 0 && item.materialCode && item.invoiceNo);

      if (uploadedItems.length > 0) {
        // Take the top date
        const topDateStr = uploadedItems[0].dateStr;

        // Filter the rest to only include rows matching the top date
        uploadedItems = uploadedItems.filter(item => item.dateStr === topDateStr);









        // Group by matching fields to aggregate amounts and pieces
        const itemMap = new Map();
        uploadedItems.forEach(item => {
          const key = `${item.invoiceNo}|${item.materialCode}|${item.packagingType}|${item.salesOrderNo}|${item.customer}|${item.rate}|${item.shipToParty}`;
          if (itemMap.has(key)) {
            const existingItem = itemMap.get(key);
            existingItem.pieces += item.pieces || 0;
            existingItem.invoiceAmount += item.invoiceAmount || 0;
            existingItem.taxableValueForGST += item.taxableValueForGST || 0;
          } else {
            itemMap.set(key, { ...item });
          }
        });
        uploadedItems = Array.from(itemMap.values());










        // Try to parse DD-MM-YYYY or similar format to fill the date input (YYYY-MM-DD)
        if (topDateStr && typeof topDateStr === 'string') {
          const parts = topDateStr.split('-');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            setDate(`${year}-${month}-${day}`);
          }
        } else if (typeof topDateStr === 'number') {
          // Excel numeric date fallback
          const excelDate = new Date(Math.round((topDateStr - 25569) * 86400 * 1000));
          const year = excelDate.getFullYear();
          const month = String(excelDate.getMonth() + 1).padStart(2, '0');
          const day = String(excelDate.getDate()).padStart(2, '0');
          setDate(`${year}-${month}-${day}`);
        }
      }

      setItems((prev) => [...prev, ...uploadedItems]);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const router = useRouter();

  return (
    <div className="p-8 m-8 rounded-xl max-w-[90rem] mx-auto bg-gradient-to-br from-indigo-50 to-blue-100 shadow-xl border border-indigo-100">
      <ToastContainer hideProgressBar />
      <button
        onClick={() => router.push('/mes/report/dispatchOut')}
        className="bg-indigo-600 absolute top-6 right-[12rem] z-50 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium transition-all duration-200"
      >
        View Report
      </button>
      <div className="absolute top-6 right-6 z-50">
        <LogoutButton />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-indigo-900 mb-8 flex items-center gap-3">
          <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </span>
          Dispatch Out
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="w-full md:w-1/3">
            <InputField label="Date:" type="date" value={date} onChange={setDate} error={errors.date} />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md cursor-pointer transition-all duration-200 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Upload Excel
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <InputField label="Invoice No:" value={invoiceNo} onChange={setInvoiceNo} error={errors.invoiceNo} />
          <InputField label="Sales Order No:" value={salesOrderNo} onChange={setSalesOrderNo} />
          <InputField label="Customer:" value={customer} onChange={setCustomer} error={errors.customer} />
          <InputField label="Ship To Party:" value={shipToParty} onChange={setShipToParty} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <CodeInput code={materialCode} setCode={setMaterialCode} codeOptions={materialCodeOptions} />
            {errors.materialCode && <p className="text-red-500 text-sm mt-1 font-medium">{errors.materialCode}</p>}
          </div>
          <div>
            <InputField label="Grade" value={grade} />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Packaging Type</label>
            <select className="h-10 border border-gray-300 bg-gray-50 rounded-lg px-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" value={packagingType} onChange={(e) => setPackagingType(e.target.value)}>
              <option>Select</option>
              <option>Box packing</option>
              <option>Poly packing</option>
            </select>
            {errors.packagingType && <p className="text-red-500 text-sm mt-1 font-medium">{errors.packagingType}</p>}
          </div>
          <InputField label="Number of Pieces" type="number" value={pieces} onChange={setPieces} error={errors.pieces} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <InputField label="Rate" type="number" value={rate} onChange={setRate} />
          <InputField label="Invoice Amount" type="number" value={invoiceAmount} onChange={setInvoiceAmount} />
          <InputField label="Taxable Value GST" type="number" value={taxableValueForGST} onChange={setTaxableValueForGST} />
        </div>

        <div className="flex justify-center mb-4">
          <AddItemsButton className="bg-indigo-600" onClick={handleAddItem} color="indigo" label={editingId ? "Update Item" : "Add Items +"} />
        </div>
      </div>

      {items.length > 0 && (
        <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Dispatched Items
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">{items.length}</span>
            </h2>
          </div>
          <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-xs tracking-wider">
                    <th className="text-left py-4 px-4">Inv. No</th>
                    <th className="text-left py-4 px-4">Material</th>
                    <th className="text-left py-4 px-4">Grade</th>
                    <th className="text-left py-4 px-4">Packing</th>
                    <th className="text-right py-4 px-4">Pieces</th>
                    <th className="text-left py-4 px-4">Customer</th>
                    <th className="text-right py-4 px-4">Amount</th>
                    <th className="text-right py-4 px-4">Ship to party</th>
                    <th className="text-center py-4 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.invoiceNo}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.materialCode}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.packagingType}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{item.pieces.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-[12rem]" title={item.customer}>{item.customer}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">{item.invoiceAmount ? `₹${item.invoiceAmount.toLocaleString('en-IN')}` : '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-[12rem]" title={item.shipToParty}>{item.shipToParty}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => handleEdit(item.id)}>
                            <Pencil size={16} />
                          </Button>
                          <Button size="sm" variant="destructive" className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
              <div className="text-lg font-bold text-gray-900">
                Total Pieces: <span className="text-indigo-700 ml-2">{totalPieces.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {items.length > 0 &&
        //  <div className="flex justify-end mt-6">
        //   <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleSubmit}>
        //     Submit Dispatch
        //   </Button>
        // </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Submitting...
              </>
            ) : (
              <>
                Submit Dispatch
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </>
            )}
          </button>
        </div>
      }
    </div>
  )
}
