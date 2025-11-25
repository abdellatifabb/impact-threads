import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="font-serif text-4xl">Unauthorized Access</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link to="/">
          <Button className="rounded-full">Return Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
