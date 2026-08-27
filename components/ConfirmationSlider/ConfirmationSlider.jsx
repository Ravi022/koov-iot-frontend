"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import LoadingSkeleton from "./LoadingSkeleton";

export default function ConfirmationSlider({
  initialPermission,
  fetchPermissionStatus,
}) {
  const [isPermissionGranted, setIsPermissionGranted] =
    useState(initialPermission); // Initialize from props
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // No initial loading state

  console.log(
    "initialPermission fetchPermissionStatus",
    initialPermission,
    isPermissionGranted
  );

  // Sync isPermissionGranted with initialPermission whenever it changes
  useEffect(() => {
    setIsPermissionGranted(initialPermission);
  }, [initialPermission]);

  const handleSwitchChange = () => {
    setShowGrantDialog(true); // Show confirmation dialog on switch change
  };

  const sendPermissionUpdate = async (canAssignTasks) => {
    const accessToken = localStorage.getItem("accessToken");
    setIsLoading(true); // Start loading
    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/admin/setTaskPermission",
        { canAssignTasks }, // Payload to update permission
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setIsPermissionGranted(canAssignTasks); // Update local state based on the response
      console.log("Permission update sent successfully");
      // console.log(response.data);
      fetchPermissionStatus();
    } catch (error) {
      console.error("Error updating permission:", error);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const confirmChange = () => {
    const newPermission = !isPermissionGranted; // Toggle permission
    sendPermissionUpdate(newPermission); // Send updated permission
    setShowGrantDialog(false); // Close dialog
  };

  const cancelChange = () => {
    setShowGrantDialog(false); // Close dialog
  };

  if (isLoading) {
    return (
      <div className="mt-4 text-muted-foreground">
        <LoadingSkeleton />
      </div>
    ); // Loading message
  }

  return (
    <div className="flex flex-col items-center justify-center bg-background border rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Daily Task Permission</h2>
      <div className="flex items-center space-x-2">
        <Switch
          id="task-permission"
          checked={isPermissionGranted}
          onCheckedChange={handleSwitchChange}
        />
        <Label htmlFor="task-permission">
          {isPermissionGranted ? "Permission Granted" : "Grant Permission"}
        </Label>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Status:{" "}
        {isPermissionGranted
          ? "Permission to Add Tasks: Granted"
          : "Permission to Add Tasks: Not Granted"}
      </p>

      {/* Confirmation Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPermissionGranted ? "Revoke Permission" : "Grant Permission"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {isPermissionGranted ? "revoke" : "grant"} permission for the
              salesperson to add daily tasks?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelChange}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={confirmChange} disabled={isLoading}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
