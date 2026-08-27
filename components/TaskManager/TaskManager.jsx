"use client";
import { API_BASE_URL } from "@/lib/api";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, CheckCircle2, Lock, Unlock, Download } from "lucide-react";

// Import ShadCN UI Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TaskManager() {
  // State for tasks and permissions
  const [regularTasks, setRegularTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [isAddingDisabled, setIsAddingDisabled] = useState(false);
  const [document, setDocument] = useState(null); // Selected file
  const [latestDocument, setLatestDocument] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // State for modal (completion additional details)
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [contactPersonName, setContactPersonName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [feedback, setFeedback] = useState("");

  // Fetch tasks and permissions
  const fetchTasksAndPermissions = async () => {
    const token = localStorage.getItem("accessToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/canAddTasks`,
        config
      );

      if (response.status === 200) {
        const { canAssignTasks, tasks, latestDocument } = response.data;
        setIsAddingDisabled(!canAssignTasks);
        setRegularTasks(tasks.regularTasks);
        setCompletedTasks([...tasks.completedTasks, ...tasks.extraAddedTasks]);
        setLatestDocument(latestDocument);
      }
    } catch (error) {
      console.error("Error fetching tasks and permissions:", error);
    }
  };

  useEffect(() => {
    fetchTasksAndPermissions();
  }, []);

  // Document upload handler
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocument(file);
    }
  };

  // Submit new task/document
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure at least one field is filled
    if (!newTask.trim() && !document) {
      setErrorMessage("Please provide a task or upload a document.");
      return;
    }

    setErrorMessage("");
    const token = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const formData = new FormData();

    if (newTask.trim()) {
      formData.append(
        "tasks",
        JSON.stringify([{ description: newTask, isExtraTask: false }])
      );
    }

    if (document) {
      formData.append("file", document);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/assignDailyTask`,
        formData,
        config
      );

      if (response.status === 200) {
        if (newTask.trim()) {
          const newTaskObj = {
            _id: response.data.tasks[0]._id,
            description: newTask,
            completed: false,
          };
          setRegularTasks((prevTasks) => [...prevTasks, newTaskObj]);
        }
        if (response.data.fileUrl) {
          setLatestDocument(response.data.fileUrl);
        }
        setNewTask("");
        setDocument(null);
        fetchTasksAndPermissions();
      }
    } catch (error) {
      console.error("Error submitting task/document:", error);
    }
  };

  // Open the modal to collect additional details when marking task as completed
  const handleTaskCompletion = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  // Submit the completion details to mark task as completed
  const submitCompletionDetails = async () => {
    // Validate required fields (emailId is optional)
    if (
      !contactPersonName.trim() ||
      !companyName.trim() ||
      !feedback.trim()
    ) {
      alert("All fields except Email id are mandatory.");
      return;
    }

    // If phoneNumber is provided (non-empty after trimming), validate that it's exactly 10 digits.
    if (phoneNumber.trim() && !/^\d{10}$/.test(phoneNumber.trim())) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    // // Validate email if provided
    // if (
    //   emailId.trim() &&
    //   !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailId.trim())
    // ) {
    //   alert("Please enter a valid email address.");
    //   return;
    // }

    const token = localStorage.getItem("accessToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const payload = {
      taskId: selectedTask._id,
      contactPersonName: contactPersonName.trim(),
      companyName: companyName.trim(),
      emailId: emailId.trim() || null,
      phoneNumber: phoneNumber.trim() || null,
      feedback: feedback.trim(),
    };

    try {
      await axios.post(
        `${API_BASE_URL}/user/markTaskAsCompleted`,
        payload,
        config
      );

      // Update local state: remove from regular tasks, add to completed tasks
      setRegularTasks((prev) =>
        prev.filter((task) => task._id !== selectedTask._id)
      );
      setCompletedTasks((prev) => [
        ...prev,
        { ...selectedTask, completed: true },
      ]);

      // Reset modal and its fields
      setShowModal(false);
      setSelectedTask(null);
      setContactPersonName("");
      setCompanyName("");
      setEmailId("");
      setPhoneNumber("");
      setFeedback("");
    } catch (error) {
      console.error("Error marking task as completed:", error);
    }
  };

  // Filter tasks for display
  const incompleteTasks = regularTasks.filter((task) => !task.completed);
  const completedTaskList = completedTasks; // Already provided from backend

  return (
    <div className="p-6 bg-background text-foreground rounded-lg shadow-md border">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Task Manager</h1>
        <div className="flex items-center space-x-4">
          <Switch
            checked={isAddingDisabled}
            aria-label="Toggle Adding New Tasks"
            disabled
          />
          <span className="text-sm font-medium">
            {isAddingDisabled ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </span>
        </div>
      </div>

      {/* Task/Document Submission Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col space-y-4">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
            className="flex-grow"
            disabled={isAddingDisabled}
          />
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              onChange={handleDocumentUpload}
              className="flex-grow"
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
            {document && (
              <p className="text-sm text-muted-foreground">
                Selected file: {document.name}
              </p>
            )}
          </div>
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full mt-4"
          disabled={isAddingDisabled}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Submit
        </Button>
      </form>

      {/* Latest Document Section */}
      {latestDocument && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Latest Document</h2>
          <div className="flex items-center space-x-4">
            <a
              href={latestDocument}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Latest Document
            </a>
          </div>
        </div>
      )}

      {/* Incomplete Tasks */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Today&apos;s Tasks</h2>
        {incompleteTasks.length === 0 ? (
          <p className="text-muted-foreground">
            No tasks for today. Add a new task!
          </p>
        ) : (
          <ul className="space-y-2">
            {incompleteTasks.map((task) => (
              <li key={task._id} className="flex items-center space-x-2">
                <Checkbox
                  id={task._id}
                  checked={task.completed}
                  // Instead of toggling immediately, open the modal to collect extra details
                  onCheckedChange={() => handleTaskCompletion(task)}
                />
                <label htmlFor={task._id} className="flex-grow">
                  {task.description}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Completed Tasks */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Completed Tasks</h2>
        {completedTaskList.length === 0 ? (
          <p className="text-muted-foreground">
            No completed tasks yet. Keep going!
          </p>
        ) : (
          <ul className="space-y-2">
            {completedTaskList.map((task) => (
              <li key={task._id} className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{task.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal for Additional Details on Task Completion */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="block mb-1">Name of the Contact Person</Label>
              <Input
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                placeholder="Enter contact person's name"
              />
            </div>
            <div>
              <Label className="block mb-1">Company</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label className="block mb-1">Email id (Optional)</Label>
              <Input
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="Enter email id"
              />
            </div>
            <div>
              <Label className="block mb-1">Contact Number</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={phoneNumber}
                onChange={(e) =>
                  // Replace any non-digit characters as user types
                  setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <Label className="block mb-1">Feedback</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter feedback"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submitCompletionDetails}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
