"use client";
import { API_BASE_URL } from "@/lib/api";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import "react-toastify/dist/ReactToastify.css";

export default function Payroll() {
  const [payroll, setPayroll] = useState('');
  const [contractorLabour, setcontractorLabour] = useState('');
  const [otherLabour, setOtherLabour] = useState('');
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get normalized date components from the selected date
  const getNormalizedDate = () => {
    const year = selectedDate.getFullYear().toString();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");

    return { year, month, day };
  };

  // Update total whenever payroll fields change
  useEffect(() => {
    const payrollAmount = parseInt(payroll) || 0;
    const contractorLabourAmount = parseInt(contractorLabour) || 0;
    const otherLabourAmount = parseInt(otherLabour) || 0;

    if (isNaN(payrollAmount) || isNaN(contractorLabourAmount) || isNaN(otherLabourAmount)) {
      setError("Please enter valid numbers for all fields.");
    } else {
      setError('');
      setTotal(payrollAmount + contractorLabourAmount + otherLabourAmount);
    }
  }, [payroll, contractorLabour, otherLabour]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log("cl", contractorLabour)

    const token = localStorage.getItem("accessToken");
    // console.log(token)

    if (!token) {
      setError("Access token not found. Please log in again.");
      return;
    }

    const { year, month, day } = getNormalizedDate();

    // console.log(payload, contractorLabour)

    if (!payroll || !contractorLabour) {
      setError('Enter Payroll and contractorLabour Details')
      return;
    }

    const payload = {
      year,
      month,
      day,
      payroll: parseInt(payroll) || 0,
      contractorLabour: parseInt(contractorLabour) || 0,
      otherLabour: parseInt(otherLabour) || 0,
    };

    try {
      // console.log(payload)
      const response = await axios.post(
        `${API_BASE_URL}/production/manPowerCosting/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Payroll information updated successfully");
        setPayroll('');
        setcontractorLabour('');
        setOtherLabour('');
        setTotal(0);
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.log(error)
      setError(error.response?.data?.message || "Failed to update. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-6xl mt-8 mx-auto">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
        <CardTitle className="text-2xl font-bold text-center">Manpower Costing Sheet</CardTitle>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate} // Set selected date on calendar selection
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payroll">Payroll (Staff + Operation)</Label>
            <Input
              id="payroll"
              type="number"
              placeholder="Enter payroll amount"
              value={payroll}
              onChange={(e) => setPayroll(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-labour">Contact Labour</Label>
            <Input
              id="contact-labour"
              type="number"
              placeholder="Enter contact labour cost"
              value={contractorLabour}
              onChange={(e) => setcontractorLabour(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="other-labour">Other Labour</Label>
            <Input
              id="other-labour"
              type="number"
              placeholder="Enter other labour cost"
              value={otherLabour}
              onChange={(e) => setOtherLabour(e.target.value)}
            />
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold">Total Payroll and Labour:</p>
            <p className="text-3xl font-bold text-primary">{total}</p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
