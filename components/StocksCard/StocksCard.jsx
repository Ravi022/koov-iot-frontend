"use client";

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

export default function TotalStocksCard() {
  const [aGradeStocks, setAGradeStocks] = useState('');
  const [bGradeStocks, setBGradeStocks] = useState('');
  const [nonMovingStocks, setNonMovingStocks] = useState('');
  const [unpackedStocks, setUnpackedStocks] = useState("");
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get normalized date components from the selected date
  const getNormalizedDate = () => {
    const year = selectedDate.getFullYear().toString();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");

    return { year, month, day };
  };

  // Update total stocks whenever packed or unpacked stocks change
  useEffect(() => {
    const aGrade = parseInt(aGradeStocks) || 0;
    const bGrade = parseInt(bGradeStocks) || 0;
    const unpacked = parseInt(unpackedStocks) || 0;
    const nonMoving = parseInt(nonMovingStocks) || 0;


    if (aGrade !== "" && isNaN(aGrade)) {
      setError("Please enter a valid number for A-grade Stock");
    }
    else if (bGrade !== '' && isNaN(bGrade)) {
      setError("Please enter a valid number for B-grade Stock");
    }
    else if (unpackedStocks !== "" && isNaN(unpacked)) {
      setError("Please enter a valid number for unpacked stocks.");
    } else {
      setError("");
      setTotal(aGrade + bGrade + unpacked + nonMoving);
    }
  }, [aGradeStocks, bGradeStocks, unpackedStocks, nonMovingStocks]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Access token not found. Please log in again.");
      return;
    }

    if (!aGradeStocks || !bGradeStocks || !nonMovingStocks || !nonMovingStocks || !unpackedStocks) {
      setError("All field are required");
      return;
    }

    // Get normalized date values from the selected date
    const { year, month, day } = getNormalizedDate();

    const payload = {
      year,
      month,
      day,
      agradeStocks: parseInt(aGradeStocks) || 0,
      bgradeStocks: parseInt(bGradeStocks) || 0,
      nonMovingStocks: parseInt(nonMovingStocks) || 0,
      unpackedStocks: parseInt(unpackedStocks) || 0,
    };

    try {
      // console.log(payload)
      const response = await axios.post(
        "http://127.0.0.1:5001/production/stocks/update",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("res", response);
        toast.success("Stocks updated successfully");
        setAGradeStocks('');
        setBGradeStocks('');
        setNonMovingStocks('');
        setUnpackedStocks('')
        setTotal(0);

      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update stocks. Please try again."
      );
    }
  };

  return (
    <Card className="w-full max-w-6xl mb-4 mx-auto">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
        <CardTitle className="text-2xl font-bold text-center">
          Total Stocks
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
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
            <Label htmlFor="a-grade-stocks">A-Grade Stocks</Label>
            <Input
              id="a-grade-stocks"
              type="number"
              placeholder="Enter A-grade stocks"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={aGradeStocks}
              onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}
              onChange={(e) => setAGradeStocks(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="b-grade-stocks">B-Grade Stocks</Label>
            <Input
              id="b-grade-stocks"
              type="number"
              placeholder="Enter B-grade stocks"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={bGradeStocks}
              onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}
              onChange={(e) => setBGradeStocks(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="non-moving-stocks">Non-Moving Stocks</Label>
            <Input
              id="non-moving-stocks"
              type="number"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="Enter non-moving stocks"
              value={nonMovingStocks}
              onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}
              onChange={(e) => setNonMovingStocks(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unpacked-stocks">Unpacked Stocks</Label>
            <Input
              id="unpacked-stocks"
              type="number"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="Enter unpacked stocks"
              value={unpackedStocks}
              onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}
              onChange={(e) => setUnpackedStocks(e.target.value)}
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Total Stocks:</p>
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
