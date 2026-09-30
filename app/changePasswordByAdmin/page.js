"use client";
import { API_BASE_URL } from "@/lib/api";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios"; // Make sure axios is installed in your project
import { useRouter } from "next/navigation"; // Import the useRouter hook
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header/Header";
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRouteAdmin from "@/components/ProtectedRouteAdmin/ProtectedRouteAdmin";

export default function AdminChangePassword() {
  const router = useRouter(); // Initialize the useRouter hook

  const [jobId, setJobId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // toast.success("Password changed successfully")
    setError("");

    if (!jobId || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken"); // Retrieve the token from localStorage

      const response = await axios.post(
        `${API_BASE_URL}/common/adminChangePasswordOfSalesperson`,
        {
          jobId: jobId,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Send the token in the Authorization header
          },
        }
      );

      if (response.status === 200) {
        // alert("Password changed successfully");
        toast.success("Password changed successfully") // Show success alert
        setJobId("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push('/admin')
        }, 1000);
        // router.back(); // Navigate to the previous page
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError(
        error.response?.data?.message ||
        "An error occurred while changing the password"
      );
    }
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case "new":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  return (
    <ProtectedRouteAdmin>
      <div className="min-h-screen flex flex-col gap-[8rem]">
        <div>
          <ToastContainer />
          <Header />
        </div>
        <div className="w-full flex flex-row justify-center items-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Admin Change Password</CardTitle>
              <CardDescription>
                Enter the Job ID and set a new password
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-id">Job ID</Label>
                  <Input
                    id="job-id"
                    type="text"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Change Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </ProtectedRouteAdmin>
  );
}
