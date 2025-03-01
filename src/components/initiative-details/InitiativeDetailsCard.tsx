
import React from "react";
import { Initiative } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InitiativeDetailsCardProps {
  initiative: Initiative;
}

export const InitiativeDetailsCard: React.FC<InitiativeDetailsCardProps> = ({ initiative }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
          <p>{initiative.description || "No description provided."}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
          <p>
            {format(initiative.startDate, "MMM d, yyyy")} - {format(initiative.endDate, "MMM d, yyyy")}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <Badge variant={initiative.completed ? "success" : "secondary"}>
            {initiative.completed ? "Completed" : "In Progress"}
          </Badge>
        </div>

        {initiative.progress !== undefined && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
            <p className="text-lg font-medium">{initiative.progress}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
