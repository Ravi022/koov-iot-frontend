"use client";
import { API_BASE_URL } from "@/lib/api";

import React, { useState } from "react";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaDownload } from "react-icons/fa";
import { AiOutlineEye } from "react-icons/ai";

// Use Popover for a clickable popup (mobile-friendly)
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const salespeople = [
  // { id: "SP001", name: "Ravikumar N", jobId: "KIOL2238", area: "Bangalore" },
  // { id: "SP002", name: "Sugumar R", jobId: "KIOL2236", area: "Chennai, TN" },
  // { id: "SP003", name: "Vineesh Mehta", jobId: "KIOL2239", area: "Delhi" },
  {
    id: "SP001",
    name: "Soma Naveen",
    jobId: "KIOL2070",
    area: "Hyderabad",
  },
  {
    id: "SP002",
    name: "Bharat Lal",
    jobId: "KIOL2064",
    area: "Maharashtra",
  },
  { id: "SP003", name: "K. Senthil Kumar", jobId: "KIOL2323", area: "Hyderabad" },
  // { id: "SP004", name: "Rakesh Gayashankar Tripathi", jobId: "KIOL2322", area: "Gujarat" },
  { id: "SP005", name: "Shubham Sharma", jobId: "KIOL2319", area: "Delhi" },
  // { id: "SP006", name: "Munin Sakia", jobId: "KIOL2246", area: "PAN INDIA" },
  // { id: "SP007", name: "Yogesh Lahoti", jobId: "KIOL2049", area: "PAN INDIA" },
  // { id: "SP008", name: "Shourajit Biswas", jobId: "KIOL2247", area: "Agartala" }
];

const TaskList = ({ tasks = [], title }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold capitalize">{title}</h3>
    <ul className="space-y-2">
      {Array.isArray(tasks) && tasks.length > 0 ? (
        tasks.map((task, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
            <span className="text-sm">{task?.taskDescription}</span>
          </li>
        ))
      ) : (
        <p>No available tasks</p>
      )}
    </ul>
  </div>
);

const CompletedTaskItem = ({ task }) => {
  return (
    <li className="flex items-center justify-between">
      <span className="text-sm">{task?.taskDescription}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1 rounded hover:bg-gray-200">
            <AiOutlineEye size={20} />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="center">
          <Card className="w-64">
            <CardHeader>
              <CardTitle className="text-sm">Additional Details</CardTitle>
              <CardDescription className="text-xs">
                {task.additionalDetails ? (
                  <div className="space-y-1">
                    <p>
                      <strong>Contact:</strong>{" "}
                      {task.additionalDetails.contactPersonName}
                    </p>
                    <p>
                      <strong>Company:</strong>{" "}
                      {task.additionalDetails.companyName}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {task.additionalDetails.emailId || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {task.additionalDetails.phoneNumber}
                    </p>
                    <p>
                      <strong>Feedback:</strong>{" "}
                      {task.additionalDetails.feedback}
                    </p>
                  </div>
                ) : (
                  "No details available"
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        </PopoverContent>
      </Popover>
    </li>
  );
};

export default function AdminTasks() {
  const [date, setDate] = useState(new Date());
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [tasksData, setTasksData] = useState({
    tasks: [],
    completedTasks: [],
    incompleteTasks: [],
    extraTasks: [],
  });
  const [latestDocument, setLatestDocument] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedSalesperson) {
      alert("Please select a salesperson");
      return;
    }

    const formattedDate = date.getDate();
    const formattedMonth = date.getMonth() + 1;
    const formattedYear = date.getFullYear();

    const payload = {
      date: formattedDate,
      month: formattedMonth,
      year: formattedYear,
      jobId: selectedSalesperson,
    };

    const token = localStorage.getItem("accessToken");
    console.log("payload :", payload);
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/admin/adminViewTasks`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data) {
        setTasksData(
          response?.data || {
            tasks: [],
            completedTasks: [],
            incompleteTasks: [],
            extraTasks: [],
          }
        );
        setLatestDocument(response?.data?.latestDocument);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Failed to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = () => {
    if (latestDocument) {
      const link = document.createElement("a");
      link.href = latestDocument;
      const urlParts = latestDocument.split("/");
      const filename = urlParts[urlParts.length - 1] || "document";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No document available for download.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="w-full lg:w-auto">
          <CardHeader>
            <CardTitle>Select Date and Salesperson</CardTitle>
            <CardDescription>
              Choose a date and salesperson to view tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <Select onValueChange={setSelectedSalesperson}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select salesperson" />
              </SelectTrigger>
              <SelectContent>
                {salespeople.map((person) => (
                  <SelectItem key={person?.id} value={person?.jobId}>
                    {person?.name} (Job ID: {person.jobId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSubmit} className="w-full">
              {loading ? "Loading..." : "Submit"}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>Tasks Overview</CardTitle>
            <CardDescription>Completed and Incomplete Tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* Completed Tasks */}
              <ScrollArea className="h-[calc(100vh-30rem)] pr-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold capitalize">
                    Completed Tasks
                  </h3>
                  {tasksData?.completedTasks &&
                    tasksData?.completedTasks.length > 0 ? (
                    <ul className="space-y-2">
                      {tasksData.completedTasks.map((task) => (
                        <CompletedTaskItem key={task.taskId} task={task} />
                      ))}
                    </ul>
                  ) : (
                    <p>No available tasks</p>
                  )}
                </div>
              </ScrollArea>

              {/* Incomplete Tasks */}
              <ScrollArea className="h-[calc(100vh-30rem)] pr-4">
                <TaskList
                  tasks={tasksData?.incompleteTasks || []}
                  title="Incomplete Tasks"
                />
              </ScrollArea>

              {/* Download Document */}
              <div
                className="flex flex-row w-full h-fit items-center space-x-3 cursor-pointer"
                onClick={handleDownloadClick}
              >
                <div className="font-bold w-fit flex justify-start">
                  Click here to download document
                </div>
                <FaDownload className="text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
