"use client";
import { API_BASE_URL } from "@/lib/api";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import "react-toastify/dist/ReactToastify.css";

export default function RejectionReportForm() {
  const [lineRejection, setLineRejection] = useState("");
  const [packingRejection, setPackingRejection] = useState("");
  const [scrap, setScrap] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState("");

  // Calculate Total Rejection dynamically
  const totalRejection = (parseInt(lineRejection) || 0) +
    (parseInt(packingRejection) || 0)

  // Get formatted date (YYYY, MM, DD)
  const getNormalizedDate = () => {
    const year = selectedDate.getFullYear().toString();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");
    return { year, month, day };
  };

  // useEffect(() => {
  //    if(packingRejection && lineRejection){
  //      console.log("scarp calculation");
  //      let totalScrap = totalRejection * 3.1;
  //      let scrapInMT = totalScrap/1000000;
  //      setScrap(scrapInMT);
  //    }
  //    else{
  //      setScrap('')
  //    }
  // },[packingRejection, lineRejection])

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Access token not found. Please log in again.");
      return;
    }

    // if (!lineRejection || !packingRejection || !scrap) {
    //   setError("All fields are required.");
    //   return;
    // }

    const { year, month, day } = getNormalizedDate();

    const payload = {
      year,
      month,
      day,
      lineRejection: parseFloat(lineRejection),
      packingRejection: parseFloat(packingRejection),
      scrap: parseFloat(scrap),
    };

    // console.log("Payload", payload);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/production/rejectionReport/update`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        toast.success("Rejection report updated successfully!");
        setLineRejection("");
        setPackingRejection("");
        setScrap("");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Failed to update rejection report.");
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto mb-4">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
        <CardTitle className="text-2xl font-bold text-center">
          Rejection Report
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="line-rejection">Line Rejection</Label>
            <Input
              id="line-rejection"
              type="number"
              placeholder="Enter line rejection in pcs"
              value={lineRejection}
              onChange={(e) => setLineRejection(e.target.value)}
              // className="appearance-none"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="packing-rejection">Packing Rejection</Label>
            <Input
              id="packing-rejection"
              type="number"
              placeholder="Enter packing rejection in pcs"
              value={packingRejection}
              onChange={(e) => setPackingRejection(e.target.value)}
              // className="appearance-none"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}


            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scrap">Scrap (MT)</Label>
            <Input
              id="scrap"
              type="number"
              placeholder="Enter scrap in MT"
              value={scrap}
              //  readOnly
              onChange={(e) => setScrap(e.target.value)}
              // className="appearance-none"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}
            />
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold">Total Rejection</p>
            <p className="text-3xl font-bold text-primary">{totalRejection}</p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}
