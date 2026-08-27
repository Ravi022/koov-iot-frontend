

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Package, Box, Layers, Archive, Ban, Trash2, Factory, Truck
} from 'lucide-react';

import { Card, CardContent } from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const headings = [
    { label: "FG Bulk", key: "piecesFgBulk", icon: Package },
    { label: "FG Box", key: "piecesFgBox", icon: Box },
    { label: "WIP A", key: "piecesWipA", icon: Layers },
    { label: "WIP B", key: "piecesWipB", icon: Archive },
    { label: "FG Rejection", key: "piecesFgRejection", icon: Ban },
    { label: "WIP Rejection", key: "piecesWipRejection", icon: Trash2 },
    { label: "Production", key: "piecesProduction", icon: Factory },
    { label: "Dispatch", key: "piecesDispatch", icon: Truck },
];

export default function BatchWiseStockReport() {
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [data, setData] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://127.0.0.1:5001/admin/fetchBatchStockData');
                const json = await res.json();
                console.log("jsonDataBatch", json)
                setData(json.data);
            } catch (err) {
                console.log("Failed to fetch stock data", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (data.length > 0 && !selectedBatchId) {
            setSelectedBatchId(data[0].batchId);
        }
        else {
            setSelectedBatch({ materials: [] })
        }
    }, [data]);

    useEffect(() => {
        const batch = data.find((b) => b.batchId === selectedBatchId);
        if (batch) setSelectedBatch(batch);
    }, [selectedBatchId, data]);

    // Show skeleton until selection is made
    if (!selectedBatch) return <Skeleton className="h-40 w-full" />;

    // Aggregate values across all materials in the selected batch

    // console.log("selectedBatchId", selectedBatch);
    const totals = headings.reduce((acc, { key }) => {
        acc[key] = selectedBatch.materials.reduce((sum, mat) => mat.materialCode.slice(-1) !== 'R' ? sum + (mat[key] || 0) : sum + 0, 0);
        return acc;
    }, {});

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Card className="w-full mx-auto rounded-2xl border border-zinc-300 shadow-md dark:border-zinc-700">
                <CardContent className="p-6">
                    <div className='flex flex-row justify-between items-center mb-4'>
                        <h2 className='text-xl font-extrabold tracking-tight text-gray-800 dark:text-white'>
                            🧾 Batch-wise Stock Report
                        </h2>
                        <div className="min-w-36">
                            <Select
                                value={selectedBatchId}
                                onValueChange={setSelectedBatchId}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-gray-800 dark:text-white">
                                    <SelectValue placeholder="Select Batch" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-white">
                                    {data.map((item) => (
                                        <SelectItem
                                            key={item.batchId}
                                            value={item.batchId}
                                            className="hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                        >
                                            {item.batchId}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <motion.table
                        className="w-full text-sm border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { staggerChildren: 0.05 }
                            }
                        }}
                    >
                        <tbody>
                            {headings.map(({ key, label, icon: Icon }) => (
                                <motion.tr
                                    key={key}
                                    className="border-b border-zinc-200 dark:border-zinc-700 last:border-none hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                                    variants={{
                                        hidden: { opacity: 0, x: -10 },
                                        visible: { opacity: 1, x: 0 }
                                    }}
                                >
                                    <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-300 flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-blue-500" />
                                        {label}
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold text-blue-700 dark:text-blue-400">
                                        {totals[key].toLocaleString("en-IN") ?? 0}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </motion.table>
                </CardContent>
            </Card>
        </motion.div>
    );
}
