import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ObjectiveCard } from "@/components/objective-card";
import { Objective } from "@/lib/types";
import { List, GitBranchPlus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const objectiveSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

const initiativeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  objectiveId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

const Dashboard = () => {
  const [viewType, setViewType] = useState<"list" | "tree">("list");
  const [objectives, setObjectives] = useState<Objective[]>([]);

  const objectiveForm = useForm({
    resolver: zodResolver(objectiveSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    },
  });

  const initiativeForm = useForm({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      name: "",
      description: "",
      objectiveId: "",
      startDate: "",
      endDate: "",
    },
  });

  const handleDeleteObjective = (id: string) => {
    setObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, deleted: true } : obj))
    );
  };

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Button
            variant={viewType === "list" ? "default" : "outline"}
            onClick={() => setViewType("list")}
          >
            <List className="mr-2 h-4 w-4" />
            List View
          </Button>
          <Button
            variant={viewType === "tree" ? "default" : "outline"}
            onClick={() => setViewType("tree")}
          >
            <GitBranchPlus className="mr-2 h-4 w-4" />
            Tree View
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Objective
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Objective</DialogTitle>
              </DialogHeader>
              <Form {...objectiveForm}>
                <form className="space-y-4">
                  <FormField
                    control={objectiveForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={objectiveForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={objectiveForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={objectiveForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Create Objective</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Initiative
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Initiative</DialogTitle>
              </DialogHeader>
              <Form {...initiativeForm}>
                <form className="space-y-4">
                  <FormField
                    control={initiativeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={initiativeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={initiativeForm.control}
                    name="objectiveId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objective</FormLabel>
                        <FormControl>
                          <select
                            className="w-full border rounded-md p-2"
                            {...field}
                          >
                            <option value="">Select an objective</option>
                            {objectives.map((obj) => (
                              <option key={obj.id} value={obj.id}>
                                {obj.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={initiativeForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={initiativeForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Create Initiative</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {objectives
          .filter((obj) => !obj.deleted)
          .map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              onDelete={handleDeleteObjective}
            />
          ))}
      </div>
    </div>
  );
};

export default Dashboard;