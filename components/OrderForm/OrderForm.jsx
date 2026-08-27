"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "../../hooks/use-toast.js";
import { Sun, Moon } from "lucide-react";

const itemTypes = ["Electronics", "Clothing", "Books", "Food", "Other"];

export default function OrderForm() {
  const [clientName, setClientName] = useState("");
  const [itemType, setItemType] = useState("");
  const [quantity, setQuantity] = useState("");
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a client name.",
        variant: "destructive",
      });
      return;
    }

    if (!itemType) {
      toast({
        title: "Error",
        description: "Please select an item type.",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity (positive number).",
        variant: "destructive",
      });
      return;
    }

    // If all validations pass, you can process the form data here
    console.log({ clientName, itemType, quantity: quantityNum });

    toast({
      title: "Success",
      description: "Order submitted successfully!",
    });

    // Reset form fields
    setClientName("");
    setItemType("");
    setQuantity("");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="w-full bg-background text-foreground p-4  ">
      <div className="w-full  bg-card text-card-foreground rounded-lg shadow-lg p-6 border">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order Form</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemType">Item Type</Label>
            <Select value={itemType} onValueChange={setItemType} required>
              <SelectTrigger id="itemType">
                <SelectValue placeholder="Select item type" />
              </SelectTrigger>
              <SelectContent>
                {itemTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="1"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Submit Order
          </Button>
        </form>
      </div>
    </div>
  );
}
