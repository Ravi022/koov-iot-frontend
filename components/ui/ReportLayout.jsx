import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ReportLayout = ({
    title,
    description,
    icon: Icon,
    stats,
    filterBar,
    content,
    pagination,
    themeColor = "blue", // Default color
    className
}) => {
    // Map theme colors to Tailwind classes
    const colorStyles = {
        blue: { title: "text-blue-600", border: "border-t-blue-500", icon: "bg-blue-100 text-blue-600" },
        green: { title: "text-green-600", border: "border-t-green-500", icon: "bg-green-100 text-green-600" },
        red: { title: "text-red-600", border: "border-t-red-500", icon: "bg-red-100 text-red-600" },
        yellow: { title: "text-yellow-600", border: "border-t-yellow-500", icon: "bg-yellow-100 text-yellow-600" },
        purple: { title: "text-purple-600", border: "border-t-purple-500", icon: "bg-purple-100 text-purple-600" },
        indigo: { title: "text-indigo-600", border: "border-t-indigo-500", icon: "bg-indigo-100 text-indigo-600" },
        orange: { title: "text-orange-600", border: "border-t-orange-500", icon: "bg-orange-100 text-orange-600" },
        gray: { title: "text-gray-900", border: "border-t-gray-500", icon: "bg-gray-100 text-gray-900" },
    };

    const currentTheme = colorStyles[themeColor] || colorStyles.blue;

    return (
        <div className={cn("h-screen flex bg-gray-50/50 overflow-hidden", className)}>

            {/* Scrollable Main Content Area */}
            <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 overflow-hidden">

                {/* Header Section - Fixed Height */}
                <div className="flex-shrink-0 flex justify-between gap-2">
                    <div className="flex items-center gap-3">
                        {Icon && <div className={cn("p-2 rounded-lg", currentTheme.icon)}><Icon className="h-8 w-8" /></div>}
                        <div>
                            <h1 className={cn("text-2xl md:text-3xl font-bold tracking-tight", currentTheme.title)}>{title}</h1>
                            {description && <p className="text-muted-foreground text-sm md:text-base">{description}</p>}
                        </div>
                    </div>
                    {/* Stats Grid - Fixed Height */}
                    {stats && (
                        <div className="ml-10">
                            {stats}
                        </div>
                    )}
                </div>

                {/* Main Content Card - Flexible Height */}
                <Card className={cn("flex-1 flex flex-col shadow-md overflow-hidden border-t-4", currentTheme.border)}>
                    <CardHeader className="flex-shrink-0 pb-4 border-b bg-white px-4 py-2">
                        {/* Filter Bar Area */}
                        {filterBar && (
                            <div className="w-full">
                                {filterBar}
                            </div>
                        )}
                    </CardHeader>

                    {/* Table Container - Scrollable */}
                    <CardContent className="flex-1 p-0 overflow-auto bg-white relative">
                        {/* The table content goes here. It needs to handle its own internal width. */}
                        <div className="h-full w-full">
                            {content}
                        </div>
                    </CardContent>

                    {/* Pagination - Fixed at Bottom */}
                    {pagination && (
                        <div className="flex-shrink-0 p-3 border-t bg-gray-50/50 flex justify-center">
                            {pagination}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ReportLayout;
