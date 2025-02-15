
import { Objective } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isValid } from "date-fns";

const CheckIn = () => {
  const formatDate = (date: Date) => {
    if (!isValid(date)) return "Invalid date";
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Check-in</h1>
      </div>
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Check-in Frequency (days)</TableHead>
              <TableHead>Next Check-in</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Table content will be implemented in the next iteration */}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CheckIn;
