
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const NoObjectivesMessage: React.FC = () => {
  return (
    <div className="text-center py-20 bg-muted/20 rounded-lg">
      <h2 className="text-2xl font-semibold mb-2">No objectives to check in</h2>
      <p className="text-muted-foreground mb-6">
        Go to the Dashboard to create your first objective and track your progress.
      </p>
    </div>
  );
};
