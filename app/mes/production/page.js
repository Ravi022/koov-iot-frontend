"use client"

import InputField from "@/components/Mes/components/input-field";
import AddItemsButton from "@/components/Mes/components/add-items";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductionForm from "@/components/Mes/Production/ProductionForm";
import RejectionForm from "@/components/Mes/Production/RejectionForm";
import WorkLogForm from "@/components/Mes/Production/WorkLogForm";
import { categories } from "@/app/constant";
import { ArrowLeft, Loader2, FileText, Factory, Scale } from "lucide-react";
import LogoutButton from "@/components/Mes/logout/logoutButton";
import { useRouter } from "next/navigation";

export default function ProductionPage() {
  const [date, setDate] = useState();
  const [batchId, setBatchId] = useState("");
  const [shift, setShift] = useState("");
  const [line, setLine] = useState("")

  const [materialCode, setMaterialCode] = useState("");
  const [pieces, setPieces] = useState("");
  const [totalPieces, setTotalPieces] = useState("");

  // const [rejMaterialCode, setRejMaterialCode] = useState("");
  // const [rejPieces, setRejPieces] = useState("");
  const [rejTotalPieces, setRejTotalPieces] = useState("");
  const [lineRejInKg, setLineRejInKg] = useState("");
  const [avgWeight, setAvgWeight] = useState("");

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  const [totalDuration, setTotalDuration] = useState("0h 0m");
  const [addWorkLog, setAddWorkLog] = useState(false);


  const [productionItems, setProductionItems] = useState([]);
  // const [rejectionItems, setRejectionItems] = useState([]);
  const [workLogItems, setWorkLogItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productionInKg, setProductionInKg] = useState("");
  const [totalProductionInKg, setTotalProductionInKg] = useState("");


  // ── Auto-calculate Avg Weight & Line Rejection (Pcs) ──
  useEffect(() => {
    const totalKg = parseFloat(totalProductionInKg) || 0;
    const totalPcs = parseInt(totalPieces) || 0;
    const rejKg = parseFloat(lineRejInKg) || 0;

    if (totalKg > 0 && totalPcs > 0) {
      const avg = (totalKg * 1000) / totalPcs;
      setAvgWeight(avg.toFixed(2));

      if (rejKg > 0) {
        const rejPcs = Math.round((rejKg * 1000) / avg);
        setRejTotalPieces(rejPcs.toString());
      } else {
        setRejTotalPieces("");
      }
    } else {
      setAvgWeight("");
      setRejTotalPieces("");
    }
  }, [totalProductionInKg, totalPieces, lineRejInKg]);


  const getNormalizedDate = () => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear().toString();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    return { year, month, day };
  };

  const handleSubmit = async () => {
    if (!date || !shift || !line || !productionItems.length || !workLogItems.length || !lineRejInKg) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const { year, month, day } = getNormalizedDate();
    const accessToken = localStorage.getItem("accessToken");
    const payload = {
      year,
      month,
      day,
      mtdType: "production",
      shift,
      line,
      productionItems,
      totalPieces: parseInt(totalPieces || "0"),
      totalProductionInKg,
      lineRejection: parseInt(rejTotalPieces || "0"),
      lineRejectionInkg: parseFloat(lineRejInKg || "0"),
      workLogItems,
      totalDuration
    };

    console.log("payload", payload);

    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5001/production/productionMesData/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.status == 200) {
        toast.success("Data saved successfully!");

        setDate("");
        setBatchId("");
        setShift("");
        setLine("");
        setProductionItems([]);
        setTotalPieces("");
        setTotalProductionInKg("");
        setLineRejInKg("");
        setRejTotalPieces("");
        setAvgWeight("");
        setWorkLogItems([]);
        setTotalDuration("");
      }
      else {
        toast.error(result.message)
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
    finally {
      setIsLoading(false);
    }
  };


  const getDuration = (start, end) => {
    try {
      const baseDate = "1970-01-01";
      const startTime = new Date(`${baseDate}T${start}:00`);
      const endTime = new Date(`${baseDate}T${end}:00`);

      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }
      return (endTime - startTime) / 60000;
    } catch {
      return 0;
    }
  };

  const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };


  useEffect(() => {
    const updatedItems = workLogItems.map((item) => {
      const rawDuration = getDuration(item.start, item.end);
      return {
        ...item,
        duration: formatMinutes(rawDuration),
      };
    });

    const totalMinutes = updatedItems.reduce((sum, item) => {
      const durationMinutes = getDuration(item.start, item.end);
      return sum + durationMinutes;
    }, 0);

    setWorkLogItems(updatedItems);
    setTotalDuration(formatMinutes(totalMinutes));

  }, [addWorkLog]);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* ── Top Header Bar ── */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="mx-4 md:mx-10 px-2 md:px-4 py-2 md:py-0 md:h-14 flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
          <button
            onClick={() => router.push('/production')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Form</span>
            <span className="sm:hidden">Back</span>
          </button>

          <h1 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2 order-first md:order-none w-full md:w-auto justify-center md:justify-start">
            <Factory className="w-5 h-5 text-blue-600" />
            Production Entry
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/mes/report/production')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">View Report</span>
              <span className="sm:hidden">Report</span>
            </button>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-10 px-4 py-6 space-y-6">

        {/* ── Header Fields Card ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">General Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <InputField label="Date:" type="date" value={date} onChange={setDate} />

            {/* Shift Dropdown */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Shift:</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full border border-gray-300 bg-gray-100 h-9 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Select Shift</option>
                <option value="Day">Day</option>
                <option value="Night">Night</option>
              </select>
            </div>

            {/* Line Dropdown */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Line:</label>
              <select
                value={line}
                onChange={(e) => setLine(e.target.value)}
                className="w-full border border-gray-300 bg-gray-100 h-9 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Select Line</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={`${i + 1}`}>{`${i + 1}`}</option>
                ))}
              </select>
            </div>

            {/* Avg Weight (read-only, highlighted) */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-blue-500" />
                Avg Weight (g):
              </label>
              <input
                type="text"
                readOnly
                value={avgWeight ? `${avgWeight} g` : "—"}
                className="w-full h-9 rounded-lg px-3 text-sm font-bold border border-blue-200 bg-blue-50 text-blue-700 cursor-default"
              />
            </div>

            {/* Line Rejection (Kg) — user editable */}
            <InputField label="Line Rej (Kg):" type="Number" value={lineRejInKg} onChange={setLineRejInKg} />

            {/* Line Rejection (Pcs) — auto-calculated, read-only */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Line Rej (Pcs):</label>
              <input
                type="text"
                readOnly
                value={rejTotalPieces || "—"}
                className="w-full h-9 rounded-lg px-3 text-sm font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default"
              />
            </div>

            {/* Avg Weight formula hint */}
            <div className="flex items-end pb-1">
              <p className="text-[0.65rem] text-gray-400 leading-tight">
                <span className="font-medium text-gray-500">Formula:</span><br />
                Avg Wt = (Kg×1000) / Pcs<br />
                Rej Pcs = (Rej Kg×1000 ) / Avg Wt
              </p>
            </div>
          </div>
        </div>

        {/* ── Production & Work Log Section ── */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
          {/* Production Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <ProductionForm
              batchId={batchId}
              setBatchId={setBatchId}
              materialCode={materialCode}
              line={line}
              setLine={setLine}
              setMaterialCode={setMaterialCode}
              pieces={pieces}
              setPieces={setPieces}
              productionInKg={productionInKg}
              setProductionInKg={setProductionInKg}
              totalPieces={totalPieces}
              setTotalPieces={setTotalPieces}
              totalProductionInKg={totalProductionInKg}
              setTotalProductionInKg={setTotalProductionInKg}
              productionItems={productionItems}
              setProductionItems={setProductionItems}
            />
          </div>

          {/* Work Log Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <WorkLogForm
              start={start}
              end={end}
              description={description}
              setStart={setStart}
              setEnd={setEnd}
              setDescription={setDescription}
              addWorkLog={addWorkLog}
              setAddWorkLog={setAddWorkLog}
              workLogItems={workLogItems}
              setWorkLogItems={setWorkLogItems}
              totalDuration={totalDuration}
            />
          </div>
        </div>

        {/* ── Submit Button ── */}
        <div className="flex justify-center pb-6">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
            {isLoading ? 'Submitting...' : 'Submit Production Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
