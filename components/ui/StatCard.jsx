import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const StatCard = ({ title, value, icon: Icon, className, iconClassName }) => {
    return (
        <Card className={cn("overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-3 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                </div>
                {Icon && (
                    <div className={cn("p-3 rounded-full bg-primary/10", iconClassName)}>
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;
