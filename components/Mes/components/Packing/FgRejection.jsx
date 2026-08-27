"use client";
import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import InputField from "../input-field";
import { getNormalizedDate, materialCodeOptions } from "@/app/constant";
import { toast } from "react-toastify";
import axios from "axios";
import CodeInput from "../../CodeInput/CodeInput";

export default function FgRecheckingRejectionEntry() {
    const [items, setItems] = useState([]);
    const [date, setDate] = useState("");
    const [materialCode, setMaterialCode] = useState("");
    const [pieces, setPieces] = useState("");
    // const [batchId, setBatchId] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [packingType, setPackingType] = useState("");
    const [reason, setReason] = useState("");

    const handleAdd = () => {
        const newErrors = {};
        if (!date) newErrors.date = "Date is required";
        // if (!batchId) newErrors.batchId = "Batch ID is required";
        // else if (!batchIdOptions.includes(batchId))
        //     newErrors.batchId = "Invalid batchId"
        else if (!materialCodeOptions.includes(materialCode))
            newErrors.materialCode = "Invalid material code."
        if (!materialCode) newErrors.materialCode = "Material code is required";
        else if (!materialCodeOptions.includes(materialCode))
            newErrors.materialCode = "Invalid material code."
        if (!pieces) newErrors.pieces = "Pieces are required";
        if (!packingType) newErrors.packingType = "Packing type is required";
        if (!reason) newErrors.reason = "Reason is required";

        if (Object.keys(newErrors).length) return setErrors(newErrors);
        setItems([...items, {
            id: Date.now(),
            // batchId,
            materialCode,
            pieces: Number(pieces),
            packingType,
            reason
        }]);
        // setBatchId("");
        setMaterialCode("");
        setPieces("");
        setReason("");
        setPackingType("")
        setErrors({});
    };

    const handleDelete = (id) => setItems(items.filter((item) => item.id !== id));

    const totalPieces = useMemo(() => {
        return items.reduce((sum, item) => sum + Number(item.pieces), 0);
    }, [items]);

    const handleSubmit = async () => {
        setIsLoading(true);
        const { year, month, day } = getNormalizedDate(date);
        // const token = localStorage.getItem("accessToken");

        if (!year || !month || !day || !items.length) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const toastId = toast.loading("Submitting FG Rechecking Rejection data...");

        try {
            const response = await axios.post("http://127.0.0.1:5001/packing/fgRecheckingRejection/update", {
                year,
                month,
                day,
                items,
                totalRejection: Number(totalPieces),
            }
                // , {
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // }
            );

            if (response.status === 200 || response.status === 201) {
                toast.update(toastId, {
                    render: "FG Rechecking Rejection data submitted successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
                setItems([]);
                setDate("");
            } else {
                toast.update(toastId, {
                    render: response.data.message || "Failed to submit rejection data.",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.update(toastId, {
                render: error?.response?.data?.message || "Server or network error!",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between p-4">
                <h2 className="text-xl font-semibold text-red-700 mb-4">FG Rechecking Rejection Entry</h2>
                <InputField label="" type="date" value={date} onChange={setDate} error={errors.date} />
            </div>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mb-4">
                {/* <InputField label="Batch ID:" value={batchId} onChange={setBatchId} error={errors.batchId} /> */}
                {/* <div>
                    <CodeInput label="BatchId" code={batchId} setCode={setBatchId} codeOptions={batchIdOptions} />
                    {errors.batchId && <p className="text-red-600 text-sm">{errors.batchId}</p>}
                </div> */}
                <div>
                    {/* <label className="block text-sm font-medium">Material Code</label>
                    <select
                        className="w-full border rounded mt-1 h-9 bg-gray-200"
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
                    {errors.materialCode && <p className="text-red-600 text-sm">{errors.materialCode}</p>}
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
                <div>
                    <label className="block text-sm font-medium">Packing Type</label>
                    <select
                        className="w-full border rounded mt-1 h-9 bg-gray-200"
                        value={packingType}
                        onChange={(e) => setPackingType(e.target.value)}
                    >
                        <option value="">Select</option>
                        <option value="Box packing">Box packing</option>
                        <option value="Poly packing">Poly packing</option>
                    </select>
                    {errors.packingType && <p className="text-red-600 text-sm">{errors.packingType}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Reason</label>
                <textarea
                    rows={2}
                    className="w-full border rounded mt-1 bg-gray-200 px-2 py-1"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                {errors.reason && <p className="text-red-600 text-sm">{errors.reason}</p>}
            </div>

            <div className="flex justify-center mb-6">
                <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
                    Add Entry
                </button>
            </div>

            {items.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Fg Rejection Items</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b">
                                {/* <th className="py-2">Batch ID</th> */}
                                <th>Material Code</th>
                                <th>Pieces</th>
                                <th>Packing Type</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b">
                                    {/* <td className="py-2">{item.batchId}</td>  */}
                                    <td>{item.materialCode}</td>
                                    <td>{item.pieces}</td>
                                    <td>{item.packingType}</td>
                                    <td>{item.reason}</td>
                                    <td>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">
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
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
                                {isLoading ? 'Submitting...' : 'Submit Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
