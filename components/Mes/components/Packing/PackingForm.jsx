import { useEffect, useState } from "react"
import { Loader2, Trash2, Pencil } from "lucide-react"
import InputField from "../input-field"
import AddItemsButton from "../add-items"
import { boxOptions, materialCodeOptions, polyOptions } from "@/app/constant"
import { gradeOptions } from "@/app/constant"
import { packingTypeOptions } from "@/app/constant"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import LogoutButton from "../../logout/logoutButton"
import CodeInput from "../../CodeInput/CodeInput"

export default function PackingForm() {
    const [items, setItems] = useState([])
    const [date, setDate] = useState("")
    const [materialCode, setMaterialCode] = useState("")
    const [grade, setGrade] = useState("")
    const [pieces, setPieces] = useState();
    // const [lotNo, setLotNo] = useState("")
    const [packingType, setPackingType] = useState("")
    const [gloveCount, setGloveCount] = useState(100);
    // const [batchId, setBatchId] = useState("")
    const [totalPacking, setTotalPacking] = useState()
    const [errors, setErrors] = useState({})
    const [isLoading, setIsloading] = useState(false);
    const [editingId, setEditingId] = useState(null);


    const handleAddItem = () => {
        const newErrors = {}
        if (!date) newErrors.date = "Date is required";
        // if (!batchId)
        //     newErrors.batchId = "batchId is required"
        // else if(!batchIdOptions.includes(batchId))
        //     newErrors.batchId = "Invalid batchId"
        // if (!isValidBatchId(batchId) && batchId)
        //     newErrors.batchId = "Invalid BatchId"
        if (!materialCode) newErrors.materialCode = "Material code is required"
        else if (!materialCodeOptions.includes(materialCode))
            newErrors.materialCode = "Invalid material code."
        if (!grade) newErrors.grade = "Grade is required"
        if (!pieces) newErrors.pieces = "Pieces are required"
        // if (!lotNo) newErrors.lotNo = "Lot number is required"
        if (!packingType) newErrors.packingType = "Packing type is required"
        if (!gloveCount) newErrors.gloveCount = "Count is required"
        if (Object.keys(newErrors).length) return setErrors(newErrors)

        let updateditems;
        if (editingId) {
            updateditems = items.map(item => item.id === editingId ? {
                ...item, materialCode, grade, pieces: Number(pieces), packingType, gloveCount
            } : item);
            setEditingId(null);
        } else {
            updateditems = [
                ...items,
                {
                    id: Date.now(),
                    materialCode,
                    grade,
                    pieces: Number(pieces),
                    packingType,
                    gloveCount
                },
            ]
        }

        setItems(updateditems);
        const totalPieces = updateditems.reduce((sum, item) => sum + Number(item.pieces), 0)
        setTotalPacking(totalPieces)


        // Reset
        // setDate("")
        // setBatchId("")
        setMaterialCode("")
        setGrade("")
        setPieces()
        // setLotNo("")
        setPackingType("")
        setGloveCount("")
        setErrors({})
    }


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

    useEffect(() => {
        if (packingType === "Box packing") {
            setGloveCount(100);
        }
        if (packingType === "Poly packing") {
            setGloveCount(100);
        }
    }, [packingType]);

    const handleDelete = (id) => {
        const deletedItem = items.find((item) => item.id === id)
        setItems(items.filter((item) => item.id !== id))
        // console.log("deletedItem", deletedItem);
        setTotalPacking(prev => prev - Number(deletedItem.pieces))
        // setTotalPacking(items.reduce((item, sum) => item)
    }

    const handleEdit = (id) => {
        const itemToEdit = items.find((item) => item.id === id);
        if (itemToEdit) {
            setMaterialCode(itemToEdit.materialCode);
            setGrade(itemToEdit.grade);
            setPieces(itemToEdit.pieces);
            setPackingType(itemToEdit.packingType);
            setGloveCount(itemToEdit.gloveCount);
            setEditingId(id);
        }
    }

    const getNormalizedDate = () => {
        const dateObj = new Date(date); // ✅ convert string to Date object safely
        const year = dateObj.getFullYear().toString();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const day = dateObj.getDate().toString().padStart(2, "0");
        return { year, month, day };
    };

    const handleSubmit = async () => {
        setIsloading(true);
        const { year, month, day } = getNormalizedDate();
        const token = localStorage.getItem("accessToken");
        // console.log("token", token);

        if (!year || !month || !day || !items.length || totalPacking == null) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const toastId = toast.loading("Submitting packing data...");

        try {
            const response = await axios.post("http://127.0.0.1:5001/packing/fgEntry/update", {
                year,
                month,
                day,
                mtdType: "packing",
                items,
                totalPacking
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.update(toastId, {
                    render: "Packing data submitted successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
                setTotalPacking();
                setItems([]);
                setDate("")
                // Optionally reset form
                // resetForm();
            } else {
                toast.update(toastId, {
                    render: response.data.message || "Failed to submit packing data.",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.log(error);
            toast.update(toastId, {
                render: error?.response?.data?.message || "Server or network error!",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
        finally {
            setIsloading(false);
        }
    };

    // console.log("batchId", batchIdOptions);

    return (

        <div className="p-4 md:p-0">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-green-700">FG Entry</h2>
                <InputField
                    label=""
                    type="date"
                    value={date}
                    onChange={setDate}
                    error={errors.date}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* <InputField
                    label="Batch ID:"
                    value={batchId}
                    onChange={setBatchId}
                    error={errors.batchId}
                    readOnly={false}
                /> */}
                {/* <div>
                    <CodeInput label="BatchId" code={batchId} setCode={setBatchId} codeOptions={batchIdOptions} />
                    {errors.batchId && (
                        <p className="text-red-600 text-sm mt-1">{errors.batchId}</p>
                    )}
                </div> */}

                <div>
                    {/* <label className="block text-sm font-medium">Material Code</label>
                    <select
                        className="w-full border rounded mt-1 h-10 bg-gray-200 px-2"
                        value={materialCode}
                        onChange={(e) => setMaterialCode(e.target.value)}
                    >
                        <option value="">Select</option>
                        {materialCodeOptions.map((code) => (
                            <option key={code} value={code}>
                                {code}
                            </option>
                        ))}
                    </select> */}
                    <CodeInput code={materialCode} setCode={setMaterialCode} codeOptions={materialCodeOptions} />
                    {errors.materialCode && (
                        <p className="text-red-600 text-sm mt-1">{errors.materialCode}</p>
                    )}
                </div>

                <div>
                    <InputField
                        label="Grade"
                        type="text"
                        value={grade}
                        error={errors.grade}
                    />
                    {/* <label className="block text-sm font-medium">Grade</label>
                    <select
                        className="w-full border rounded mt-1 h-10 bg-gray-200 px-2"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                    >
                        <option value="">Select</option>
                        {gradeOptions.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>
                    {errors.grade && (
                        <p className="text-red-600 text-sm mt-1">{errors.grade}</p>
                    )} */}
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-${packingType ? "3" : "2"} gap-4 mb-6`}>
                <InputField
                    label="No. of Pieces"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pieces}
                    onChange={(val) => setPieces(val)}
                    error={errors.pieces}
                />

                <div>
                    <label className="block text-sm font-medium">Packing Type</label>
                    <select
                        className="w-full border rounded mt-1 h-10 bg-gray-200 px-2"
                        value={packingType}
                        onChange={(e) => {
                            setPackingType(e.target.value);
                            setGloveCount("");
                        }}
                    >
                        <option value="">Select</option>
                        {packingTypeOptions.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    {errors.packingType && (
                        <p className="text-red-600 text-sm mt-1">{errors.packingType}</p>
                    )}
                </div>

                {(packingType === "Box packing" || packingType === "Poly packing") && (
                    <div>
                        <label className="block text-sm font-medium">Glove Count</label>
                        {packingType === "Box packing" ? (
                            <select
                                className="w-full border rounded mt-1 h-10 bg-gray-200 px-2"
                                value={gloveCount}
                                onChange={(e) => setGloveCount(Number(e.target.value))}
                            >
                                <option value="">Select</option>
                                {boxOptions.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <select
                                className="w-full border rounded mt-1 h-10 bg-gray-200 px-2"
                                value={gloveCount}
                                onChange={(e) => setGloveCount(e.target.value)}
                            >
                                <option value="">Select</option>
                                {polyOptions.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                            // <input
                            //     type="number"
                            //     className="w-full border rounded mt-1 h-10 bg-gray-200 px-2"
                            //     value={gloveCount}
                            //     onChange={(e) => setGloveCount(e.target.value)}
                            //     placeholder="Enter glove count per bag"
                            // />
                        )}
                        {errors.gloveCount && (
                            <p className="text-red-600 text-sm mt-1">{errors.gloveCount}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-center mb-6">
                <AddItemsButton color="green" onClick={handleAddItem} label={editingId ? "Update Item" : "Add Items +"} />
            </div>

            {items.length > 0 && (
                <div className="bg-white shadow-md rounded-xl p-4 md:p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Packed Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm table-auto">
                            <thead>
                                <tr className="text-left border-b text-gray-700">
                                    {/* <th className="py-2 px-2">Batch Id</th> */}
                                    <th className="py-2 px-2">Material Code</th>
                                    <th className="py-2 px-2">Grade</th>
                                    <th className="py-2 px-2">Pieces</th>
                                    <th className="py-2 px-2">Packaging Type</th>
                                    <th className="py-2 px-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        {/* <td className="py-2 px-2">{item.batchId}</td> */}
                                        <td className="py-2 px-2">{item.materialCode}</td>
                                        <td className="py-2 px-2">{item.grade}</td>
                                        <td className="py-2 px-2">{item.pieces}</td>
                                        <td className="py-2 px-2">{item.packingType}</td>
                                        <td className="py-2 px-2 text-right">
                                            <button
                                                onClick={() => handleEdit(item.id)}
                                                className="text-blue-500 hover:text-blue-700 mr-3"
                                                title="Edit item"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-lg font-semibold text-gray-700 mt-4">
                        Total Pieces = {totalPacking}
                    </p>

                    <div className="text-right mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                            {isLoading ? 'Submitting...' : 'Submit Packing'}
                        </button>
                    </div>
                </div>
            )}
        </div>

    )
}
