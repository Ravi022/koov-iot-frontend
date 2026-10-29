'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "@/lib/api";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#f97316', '#ef4444', '#3b82f6'];

export default function DowntimeDashboard({ dateFilter, startDate, endDate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('1month');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        let url = `${API_BASE_URL}/admin/downtimeAnalytics?`;
        
        if (startDate && endDate) {
          const d1 = new Date(startDate);
          url += `month=${d1.getMonth() + 1}&year=${d1.getFullYear()}`;
        } else {
          url += `period=${period}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch downtime analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period, startDate, endDate]);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading Dashboard...</div>;
  if (!data) return <div className="p-4 text-center text-gray-500">No data available</div>;

  const { lineTotal, dateWiseData, reasonWiseData } = data;

  const pieData = [
    { name: 'Line 1', value: lineTotal['Line 1'] || 0 },
    { name: 'Line 2', value: lineTotal['Line 2'] || 0 },
    { name: 'Line 3', value: lineTotal['Line 3'] || 0 },
  ].filter(d => d.value > 0);

  const formatMinutes = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = pieData.reduce((acc, curr) => acc + curr.value, 0);
      const percent = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm text-sm">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-gray-600">Downtime: <span className="font-bold">{formatMinutes(data.value)}</span></p>
          <p className="text-gray-600">Share: {percent}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm text-sm">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">{formatMinutes(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 mb-8 mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Downtime Analytics Dashboard</h2>
        {!startDate && !endDate && (
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm text-sm focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="1month">Last 1 Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 w-full text-left">Line-Wise Downtime</h3>
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">No downtime data</div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <PieTooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Date Wise Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Date-Wise Downtime</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dateWiseData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(val) => `${Math.round(val/60)}h`} tick={{fontSize: 12, fill: '#6b7280'}} tickLine={false} axisLine={false} />
                <BarTooltip content={<CustomBarTooltip />} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="Line 1" stackId="a" fill={COLORS[0]} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Line 2" stackId="a" fill={COLORS[1]} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Line 3" stackId="a" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reason Wise Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">Top Downtime Reasons</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reasonWiseData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" tickFormatter={(val) => `${Math.round(val/60)}h`} tick={{fontSize: 12, fill: '#6b7280'}} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="reason" width={100} tick={{fontSize: 12, fill: '#374151'}} tickLine={false} axisLine={false} />
              <BarTooltip content={<CustomBarTooltip />} />
              <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              <Bar dataKey="Line 1" stackId="a" fill={COLORS[0]} />
              <Bar dataKey="Line 2" stackId="a" fill={COLORS[1]} />
              <Bar dataKey="Line 3" stackId="a" fill={COLORS[2]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
