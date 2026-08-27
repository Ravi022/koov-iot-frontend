import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"; // Import Tooltip components
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const categories = [
  { name: "Total Dispatch", info: "Total number of items dispatched" },
  { name: "Production", info: "Total number of items produced" },
  { name: "Packing", info: "Total number of items packed" },
  { name: "Sales", info: "Total sales amount in dollars" },
];

const ProductionInput = () => {
  const [metrics, setMetrics] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date()); // Calendar date state

  const handleInputChange = (category, value) => {
    setMetrics((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleSubmit = async (category) => {
    const value = metrics[category];
    if (value && !isNaN(Number(value))) {
      try {
        const accessToken = localStorage.getItem("accessToken");

        // Extract year, month, day from selected date
        const year = selectedDate.getFullYear().toString();
        const month = selectedDate.toLocaleString("default", { month: "long" });
        const day = selectedDate.getDate().toString().padStart(2, "0");

        const response = await axios.post(
          "http://127.0.0.1:5001/production/mtd/update",
          {
            year,
            month,
            day,
            mtdType: category.toLowerCase().replace(" ", ""),
            value: Number(value),
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 200) {
          toast.success(`${category} - Today metric updated successfully!`, {
            position: "bottom-right",
            autoClose: 2000,
          });
          setMetrics((prev) => ({
            ...prev,
            [category]: "",
          }));
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "An error occurred while updating.",
          {
            position: "bottom-right",
            autoClose: 2000,
          }
        );
      }
    } else {
      toast.error("Please enter a valid number", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <div>
      <ToastContainer />
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent>
          <div className="flex flex-row justify-end items-center my-4">
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
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div key={category.name} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{category.info}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`${category.name}-today`} className="w-20">
                      Today:
                    </Label>
                    <Input
                      id={`${category.name}-today`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={metrics[category.name] || ""}
                      onChange={(e) =>
                        handleInputChange(category.name, e.target.value)
                      }
                      className="flex-grow"
                    />
                    <Button onClick={() => handleSubmit(category.name)}>
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionInput;
