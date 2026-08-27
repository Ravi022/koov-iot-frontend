import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import axios from "axios";

export default function TargetInformation({
  assignedTarget,
  completedTarget,
  fetchData,
  todayCompletedTarget
}) {
  // console.log(assignedTarget, completedTarget);
  const [achievedTarget, setAchievedTarget] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    assigned: 100,
    completed: 0,
  });

  const formattedDate = format(new Date(), "MMMM d, yyyy");

  // Function to get current day, month, and year
  const getCurrentDate = () => {
    const now = new Date();
    return {
      day: now.getDate(),
      month: now.getMonth() + 1, // Months are zero-based in JS
      year: now.getFullYear(),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const achieved = parseInt(achievedTarget);
    if (isNaN(achieved) || achieved < 0) {
      setFeedback({ type: "error", message: "Please enter a valid number." });
      return;
    }

    const { day, month, year } = getCurrentDate();
    const payload = {
      completedTarget: achieved,
      day,
      month,
      year,
    };

    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.post(
        "http://127.0.0.1:5001/user/updateDailyTarget",
        payload,
        config
      );

      // Assuming response.data contains the updated targets
      // console.log("Response from backend:", response.data);
      setPerformanceData((prev) => ({
        ...prev,
        completed: prev.completed + achieved,
      }));

      setFeedback({ type: "success", message: response.data.message });
      fetchData();
      setAchievedTarget("");
    } catch (error) {
      console.error("Error updating daily target:", error);
      setFeedback({ type: "error", message: "Failed to update target." });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Target Information</CardTitle>
        {/* <CardDescription>For {formattedDate}</CardDescription> */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Assigned Target:</span>
            <span className="font-semibold">₹{assignedTarget}</span>
          </div>
          <div className="flex justify-between">
            <span>Completed Target:</span>
            <span className="font-semibold">₹{completedTarget}</span>
          </div>
          <div className="flex justify-between">
            <span>Today Completed Target:</span>
            <span className="font-semibold">₹{todayCompletedTarget}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="achieved-target">Today&apos;s Target Achieved</Label>
            <Input
              id="achieved-target"
              type="number"
              placeholder="Enter number of tasks completed"
              value={achievedTarget}
              onChange={(e) => setAchievedTarget(e.target.value)}
              min="0"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        {feedback && (
          <Alert
            variant={feedback.type === "error" ? "destructive" : "default"}
            className="w-full"
          >
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
