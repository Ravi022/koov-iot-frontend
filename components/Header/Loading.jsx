import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeaderSkeleton() {
  return (
    <header className="bg-background text-foreground shadow-md">
      <div className="container mx-auto flex justify-between items-center py-2">
        {/* Company Logo Skeleton */}
        <Skeleton className="w-[120px] h-[40px]" />

        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button Skeleton */}
          <Skeleton className="w-8 h-8 rounded-full" />

          {/* User Avatar Skeleton */}
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </header>
  );
}
