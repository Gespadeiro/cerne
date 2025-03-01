
import React from "react";

export const CheckInHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-12 text-center">
      <h1 className="text-4xl font-bold gradient-text mb-4">Progress Check-in</h1>
      <p className="text-muted-foreground max-w-2xl">
        Track your journey, celebrate progress, and stay committed to your goals.
        Regular check-ins help maintain momentum and ensure success.
      </p>
    </div>
  );
};
