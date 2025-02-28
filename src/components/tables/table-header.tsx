
import React from "react";

export function TableHeader() {
  return (
    <thead className="bg-muted/50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Timeline
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Starting Value
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Goal Value
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Current Value
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Progress
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
}
