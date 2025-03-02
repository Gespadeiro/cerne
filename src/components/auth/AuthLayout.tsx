
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthLayoutProps {
  children: ReactNode;
  description?: string;
}

export function AuthLayout({ children, description = "Sign in to your account or create a new one" }: AuthLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-[100vh] py-8 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold gradient-text">Cerne</CardTitle>
            <ThemeToggle />
          </div>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-muted-foreground text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
