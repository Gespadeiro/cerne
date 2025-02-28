
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Initiative } from "@/lib/types";
import { format, isValid } from "date-fns";

export interface InitiativeDetailsProps {
  initiative: Initiative | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InitiativeDetails({
  initiative,
  open,
  onOpenChange,
}: InitiativeDetailsProps) {
  if (!initiative) return null;

  const formatDate = (date: Date) => {
    if (!isValid(date)) return "Invalid date";
    return format(date, "MMM d, yyyy");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initiative.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{initiative.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Start Date</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(initiative.startDate)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">End Date</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(initiative.endDate)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
