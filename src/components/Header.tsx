import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" strokeWidth={2.5} />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            EpiPredict
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Pricing
          </a>
          <a href="#about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            About
          </a>
          <a href="#contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Login
          </Button>
          <Button variant="hero" size="default">
            Start Free Pilot
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
