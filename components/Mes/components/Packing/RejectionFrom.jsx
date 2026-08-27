import { useMemo, useState } from "react"
import { Loader2, Trash2, Pencil } from "lucide-react"
import InputField from "../input-field"
// import { batchIdOptions, getNormalizedDate, isValidBatchId, materialCodeOptions } from "@/app/constant"
import { getNormalizedDate, materialCodeOptions } from "@/app/constant"
import { toast } from "react-toastify"
import axios from "axios"
import CodeInput from "../../CodeInput/CodeInput"


const ALL_REASONS = ["Touching, pin hole, touching, cluster, tear and torn", "Tear, touching, torn, pin hole and cluster in gloves", "Torn, tear, touching, cluster and pin hole in gloves", "Pin hole, cluster and torn, touching,tear in gloves", "Cluster, tearing, torn in gloves", "Cluster, tearing and torn in gloves"];

export default function RejectionForm() {
    const [items, setItems] = useState([])
    const [date, setDate] = useState("")
    const [materialCode, setMaterialCode] = useState("")
    const [pieces, setPieces] = useState()
    const [reason, setReason] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [errors, setErrors] = useState({})
    // const [batchId, setBatchId] = useState("")
    const [isLoading, setIsloading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const suggestions = useMemo(() => {
        const parts = reason.split(",").map((p) => p.trim());
        const lastPart = parts[parts.length - 1] || "";
        const normalizedParts = parts.slice(0, -1).map((p) => p.toLowerCase());

        return ALL_REASONS.filter((r) => {
            const normalizedR = r.toLowerCase();
            if (normalizedParts.includes(normalizedR)) return false;
            if (lastPart) {
                return normalizedR.includes(lastPart.toLowerCase());
            }
            return true;
        });
    }, [reason]);

    const handleSelectSuggestion = (suggested) => {
        const parts = reason.split(",").map((p) => p.trim());
        parts[parts.length - 1] = suggested;
        const filteredParts = parts.filter((p) => p.length > 0);
        let nextValue = filteredParts.join(", ");

        const normalizedParts = filteredParts.map((p) => p.toLowerCase());
        const remaining = ALL_REASONS.filter((r) => !normalizedParts.includes(r.toLowerCase()));

        if (remaining.length > 0) {
            nextValue += ", ";
        }

        setReason(nextValue);
    };

    const handleAdd = () => {
        const newErrors = {}
        if (!date) newErrors.date = "Date is required"
        // if (!batchId) newErrors.batchId = "BatchId is required"
        // else if (!batchIdOptions.includes(batchId))
        //     newErrors.batchId = "Invalid batchId"
        // if (!isValidBatchId(batchId) && batchId)
        //     newErrors.batchId = "Invalid Batch Id"
        if (!materialCode) newErrors.materialCode = "Material code is required"
        else if (!materialCodeOptions.includes(materialCode))
            newErrors.materialCode = "Invalid material code."
        if (!pieces) newErrors.pieces = "Pieces are required"
        if (!reason) newErrors.reason = "Reason is required"

        if (Object.keys(newErrors).length) return setErrors(newErrors)

        if (editingId) {
            setItems(items.map((item) => item.id === editingId ? { ...item, materialCode, pieces: Number(pieces), reason } : item));
            setEditingId(null);
        } else {
            setItems([...items, { id: Date.now(), materialCode, pieces: Number(pieces), reason }])
        }
        // setDate("") 
        // setBatchId("")  
        setMaterialCode("")
        setPieces("")
        setReason("")
        setErrors({})
    }

    const handleDelete = (id) => setItems(items.filter((item) => item.id !== id))

    const handleEdit = (id) => {
        const itemToEdit = items.find((item) => item.id === id);
        if (itemToEdit) {
            setMaterialCode(itemToEdit.materialCode);
            setPieces(itemToEdit.pieces);
            setReason(itemToEdit.reason);
            setEditingId(id);
        }
    }

    // const totalPieces = items.reduce((sum, item) => (sum + Number(item.pieces)), 0)

    const totalPieces = useMemo(() => {
        return items.reduce((sum, item) => sum + Number(item.pieces), 0)
    }, [items])

    const handleSubmit = async () => {
        setIsloading(true);
        const { year, month, day } = getNormalizedDate(date);
        console.log("year, month, day", year, month, day);
        const token = localStorage.getItem("accessToken");

        // console.log("token", token);

        if (!year || !month || !day || !items.length) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const toastId = toast.loading("Submitting packing data...");

        try {
            const response = await axios.post("http://127.0.0.1:5001/packing/wipRejection/update", {
                year,
                month,
                day,
                // mtdType: "packing",
                items,
                totalPackingRej: Number(totalPieces)
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // console.log("response", response);

            if (response.status === 200 || response.status === 201) {
                toast.update(toastId, {
                    render: response.data.message,
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });

                // Optionally reset form
                setItems([]);
                setDate("")
                // resetForm();
            } else {
                toast.update(toastId, {
                    render: response.data.message || "Failed to submit Packing Rejection data.",
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

    // const handleSubmit = () => {
    //     if (items.length === 0) {
    //         alert("No items to submit")
    //         return
    //     }

    //     console.log("Submitting rejection items:", items)
    //     // Submit logic
    // }

    return (
        <div>
            <div className="flex justify-between p-4">
                <h2 className="text-xl font-semibold text-purple-700 mb-4">WIP Rejection Entry</h2>
                <InputField label="" type="date" value={date} onChange={setDate} error={errors.date} />
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4">
                {/* <InputField label="Batch ID:" value={batchId} onChange={setBatchId} error={errors.batchId} readOnly={false} /> */}
                {/* <div>
                    <CodeInput label="BatchId" code={batchId} setCode={setBatchId} codeOptions={batchIdOptions} /> 
                    {errors.batchId && <p className="text-red-600 text-sm">{errors.batchId}</p>}   
                </div> */}
                <div>
                    {/* <InputField label="Mateiral Code" value={materialCode} onChange={setMaterialCode} error={errors.materialCode} /> */}
                    {/* <label className="block text-sm font-medium">Material Code</label>
                    <select
                        className="w-full border rounded mt-1 h-9 bg-gray-200"
                        value={materialCode}
                        onChange={(e) => setMaterialCode(e.target.value)}
                    >
                        <option value="">Select</option>
                        {materialCodeOptions.map((code, index) => (
                            <option key={index} value={code}>
                                {code}
                            </option>
                        ))}
                    </select>
                    {errors.materialCode && <p className="text-red-600 text-sm">{errors.materialCode}</p>} */}
                    <CodeInput code={materialCode} setCode={setMaterialCode} codeOptions={materialCodeOptions} />
                </div>
                <InputField
                    label="No. of Pieces"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pieces}
                    onChange={setPieces}
                    error={errors.pieces}
                />
            </div>

            <div className="mb-4 relative">
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                    className="w-full bg-gray-200 border rounded p-2 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-150"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                        // Delay closing to allow clicking suggestion
                        setTimeout(() => setShowSuggestions(false), 200);
                    }}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-purple-100 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-purple-50">
                        <div className="px-3 py-1.5 text-xs font-semibold text-purple-400 bg-purple-50/50">
                            Suggestions
                        </div>
                        {suggestions.map((s, index) => (
                            <button
                                key={index}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectSuggestion(s)}
                                className="w-full text-left px-4 py-2.5 hover:bg-purple-50 text-gray-700 hover:text-purple-800 text-sm font-medium transition-all duration-150 flex items-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                {errors.reason && <p className="text-red-600 text-sm mt-1">{errors.reason}</p>}
            </div>

            <div className="flex justify-center mb-6">
                <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
                    {editingId ? "Update Rejection" : "Add Rejection"}
                </button>
            </div>
            {items.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Rejection Items</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b">
                                {/* <th className="py-2">Batch Id</th> */}
                                <th>Material Code</th>
                                <th>Pieces</th>
                                <th>Reason</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b">
                                    {/* <td className="py-2">{item.batchId}</td> */}
                                    <td>{item.materialCode}</td>
                                    <td>{item.pieces}</td>
                                    <td>{item.reason}</td>
                                    <td>
                                        <button onClick={() => handleEdit(item.id)} className="text-blue-500 hover:text-blue-700 mr-3" title="Edit item">
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700" title="Delete item">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 flex justify-between">
                        <p className="text-xl font-bold text-gray-700 mt-2">Total Pieces = {totalPieces}</p>
                        <div className="text-right mt-6">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                                {isLoading ? 'Submitting...' : 'Submit Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
