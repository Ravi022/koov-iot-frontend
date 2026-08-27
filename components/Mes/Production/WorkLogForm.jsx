
"use client";
import InputField from "@/components/Mes/components/input-field";
import AddItemsButton from "@/components/Mes/components/add-items";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

export default function WorkLogForm({
  start,
  end,
  description,
  setStart,
  setEnd,
  setDescription,
  addWorkLog,
  setAddWorkLog,
  workLogItems,
  setWorkLogItems,
  totalDuration
}) {
  const handleAddWorkLogItem = () => {
    if (start && end && description) {
      const newItem = {
        id: Date.now(),
        start,
        end,
        description,
      };
      setWorkLogItems([...workLogItems, newItem]);
      setAddWorkLog(prev => !prev);
      setStart("");
      setEnd("");
      setDescription("");
    } else {
      toast.error("Please fill all required fields in the work log form");
    }
  };

  const handleNoBreakdown = () => {
    const newItem = {
      id: Date.now(),
      start: "00:00",
      end: "00:00",
      description: "N/A",
    };
    setWorkLogItems([...workLogItems, newItem]);
    setAddWorkLog(prev => !prev);
  };

  const handleRemove = (id) => {
    setWorkLogItems(workLogItems.filter(item => item.id !== id));
    setAddWorkLog(prev => !prev);
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-bold">Work Log:</h2>
        <button
          type="button"
          onClick={handleNoBreakdown}
          className="bg-green-100 hover:bg-green-200 text-green-800 text-sm font-semibold py-1.5 px-3 rounded shadow-sm border border-green-300 transition-colors"
        >
          No Breakdown
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <InputField label="Start:" type="time" value={start} onChange={setStart} />
        <InputField label="End:" type="time" value={end} onChange={setEnd} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Description Breakdown/ Non working Time:
        </label>
        <textarea
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-center my-4">
        <AddItemsButton color="blue" onClick={handleAddWorkLogItem} />
      </div>

      {workLogItems.length > 0 && (
        <div className="mb-2">
          <h3 className="text-md font-semibold mb-2">Work Log Items:</h3>
          <div className="bg-white max-h-40 overflow-auto bg-opacity-70 rounded-lg p-2">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Start</th>
                  <th className="text-left py-1">End</th>
                  <th className="text-left py-1">Description</th>
                </tr>
              </thead>
              <tbody>
                {workLogItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-1">{item.start}</td>
                    <td className="py-1">{item.end}</td>
                    <td className="py-1">{item.description}</td>
                    <td className="py-1">{item.duration}</td>
                    <td className="py-1">
                      <button title="remove item" onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-2 font-medium text-blue-900">
              Total Duration: {totalDuration}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

