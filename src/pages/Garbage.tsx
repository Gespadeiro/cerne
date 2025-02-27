
import { ObjectivesTable } from "@/components/objectives-table";
import { Objective } from "@/lib/types";
import { useState } from "react";

const Garbage = () => {
  const [deletedItems, setDeletedItems] = useState<Objective[]>([]);

  return (
    <div className="w-full p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Garbage</h1>
        <ObjectivesTable
          objectives={deletedItems}
          onDelete={() => {}}
        />
      </div>
    </div>
  );
};

export default Garbage;
