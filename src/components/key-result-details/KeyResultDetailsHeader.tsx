
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface KeyResultDetailsHeaderProps {
  name: string;
}

export const KeyResultDetailsHeader: React.FC<KeyResultDetailsHeaderProps> = ({ name }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 mb-6">
      <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-3xl font-bold">{name}</h1>
    </div>
  );
};
