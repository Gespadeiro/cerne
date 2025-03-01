
import React from "react";

export const NoObjectivesMessage: React.FC = () => {
  return (
    <div className="text-center py-10">
      <p className="text-lg text-muted-foreground">You don't have any objectives yet.</p>
      <p className="text-muted-foreground">Go to the Dashboard to create your first objective.</p>
    </div>
  );
};
