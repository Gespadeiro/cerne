
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MessageSquare, Star, LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type FeedbackType = "suggestion" | "bug" | "praise" | "other";

const FeedbackPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      feedbackType: "" as FeedbackType,
      message: "",
      rating: 5,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        name: data.name,
        email: data.email,
        feedback_type: data.feedbackType,
        message: data.message,
        rating: data.rating,
      });

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your input and will use it to improve our app.",
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Something went wrong",
        description: "Your feedback could not be submitted. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/">
            <h1 className="text-2xl font-bold gradient-text">Cerne</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/feedback" className="text-foreground hover:text-primary">
              Give Feedback
            </Link>
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button variant="default" size="sm" className="flex items-center gap-2 bg-cerne-blue hover:bg-cerne-blue/90">
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Feedback Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">
                  We Value Your <span className="gradient-text">Feedback</span>
                </CardTitle>
                <CardDescription>
                  Help us improve Cerne by sharing your thoughts, suggestions, or reporting issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your.email@example.com" 
                                {...field} 
                                required 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="feedbackType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feedback Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select the type of feedback" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="suggestion">Suggestion</SelectItem>
                              <SelectItem value="bug">Bug Report</SelectItem>
                              <SelectItem value="praise">Praise</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the category that best describes your feedback
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Feedback</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please share your thoughts, suggestions, or report an issue..."
                              className="min-h-[150px]"
                              {...field}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate Your Experience (1-5)</FormLabel>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Button
                                key={star}
                                type="button"
                                variant={field.value >= star ? "default" : "outline"}
                                className={`h-10 w-10 p-0 ${
                                  field.value >= star ? "bg-cerne-yellow text-white" : "bg-transparent"
                                }`}
                                onClick={() => form.setValue("rating", star)}
                              >
                                <Star className="h-6 w-6" />
                              </Button>
                            ))}
                          </div>
                          <FormDescription>
                            How would you rate your overall experience with Cerne?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-center">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="bg-cerne-blue hover:bg-cerne-blue/90 min-w-[200px]"
                        disabled={isSubmitting}
                      >
                        <MessageSquare className="mr-2 h-5 w-5" />
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t mt-auto">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold gradient-text mb-4">Cerne</h2>
          <p className="text-muted-foreground mb-6">
            The OKR platform for purposeful growth
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/auth" className="text-muted-foreground hover:text-foreground">Login</Link>
            <Link to="/auth?tab=signup" className="text-muted-foreground hover:text-foreground">Sign Up</Link>
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            © {new Date().getFullYear()} Cerne. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FeedbackPage;
