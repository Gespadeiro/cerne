
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Award, ClipboardCheck, LogIn, RocketIcon, UserPlus } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">Cerne</h1>
          <div className="flex items-center gap-4">
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your <span className="gradient-text">Goals</span> into <span className="gradient-text">Achievements</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
            The OKR platform designed for entrepreneurs and self-development enthusiasts who are serious about tracking progress and achieving results.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="bg-cerne-blue hover:bg-cerne-blue/90 w-full sm:w-auto">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Login to Continue
              </Button>
            </Link>
          </div>
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">What are OKRs?</h2>
            <p className="text-muted-foreground mb-4">
              Objectives and Key Results (OKRs) is a collaborative goal-setting framework used by individuals and organizations to define measurable goals and track their outcomes.
            </p>
            <p className="text-muted-foreground">
              With Cerne, managing your OKRs becomes seamless and insightful, helping you make meaningful progress towards your vision.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Entrepreneurs and Self-Developers Choose <span className="gradient-text">Cerne</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card bg-card">
              <RocketIcon className="h-10 w-10 text-cerne-blue mb-4" />
              <h3 className="text-xl font-bold mb-2">Accelerate Growth</h3>
              <p className="text-muted-foreground">
                Turn your vision into actionable steps with our structured approach to goal setting and tracking.
              </p>
            </div>
            
            <div className="feature-card bg-card">
              <ClipboardCheck className="h-10 w-10 text-cerne-orange mb-4" />
              <h3 className="text-xl font-bold mb-2">Stay Accountable</h3>
              <p className="text-muted-foreground">
                Regular check-ins and progress tracking keep you focused and accountable to your goals.
              </p>
            </div>
            
            <div className="feature-card bg-card">
              <Award className="h-10 w-10 text-cerne-yellow mb-4" />
              <h3 className="text-xl font-bold mb-2">Celebrate Wins</h3>
              <p className="text-muted-foreground">
                Visualize your progress and celebrate milestones to maintain motivation and momentum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Challenges We Solve
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card/80 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-cerne-orange">Before Cerne</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-destructive">✖</span>
                  <span>Goals scattered across multiple tools and notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">✖</span>
                  <span>Lack of clarity on what to prioritize</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">✖</span>
                  <span>No consistent way to track progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">✖</span>
                  <span>Difficulty in balancing multiple objectives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">✖</span>
                  <span>Overwhelm leading to abandoned goals</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card/80 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-cerne-blue">With Cerne</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>All goals and initiatives in one centralized platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Clear hierarchy of objectives and key results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Structured check-ins with insights on progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Visual dashboards to monitor all areas of focus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Motivation through visible progress and achievements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cerne-blue/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Approach to Goals?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join other entrepreneurs and self-developers who are using Cerne to turn their ambitions into reality.
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="bg-cerne-blue hover:bg-cerne-blue/90">
              Start for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
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

export default Landing;
