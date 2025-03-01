
import React from "react";
import { KeyResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface KeyResultDetailsCardProps {
  keyResult: KeyResult;
}

export const KeyResultDetailsCard: React.FC<KeyResultDetailsCardProps> = ({ keyResult }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
          <p>{keyResult?.description || "No description provided."}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
          <p>
            {format(keyResult.startDate, "MMM d, yyyy")} - {format(keyResult.endDate, "MMM d, yyyy")}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Starting Value</h3>
            <p className="text-lg font-medium">{keyResult.startingValue}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Goal Value</h3>
            <p className="text-lg font-medium">{keyResult.goalValue}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Current Value</h3>
            <p className="text-lg font-medium">
              {keyResult.currentValue !== undefined ? keyResult.currentValue : "Not set"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
