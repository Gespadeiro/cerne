import { ObjectiveCard } from "@/components/objective-card";
import { Objective } from "@/lib/types";
import { useState } from "react";

const Garbage = () => {
  const [deletedItems, setDeletedItems] = useState<Objective[]>([]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Garbage</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deletedItems.map((item) => (
          <ObjectiveCard
            key={item.id}
            objective={item}
            onDelete={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default Garbage;