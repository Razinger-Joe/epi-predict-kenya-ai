import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import heroImage from "@/assets/hero-kenya-map.png";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[var(--gradient-subtle)] -z-10" />
      
      {/* Decorative glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">AI-Powered Disease Surveillance</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Predict Disease Outbreaks{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                14 Days Before They Happen
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              AI-powered disease surveillance for Kenyan hospitals, pharmacies, and county health departments
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Start Free Pilot
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="text-sm text-muted-foreground">
                Trusted by
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span>20+ Hospitals</span>
                <span className="text-border">•</span>
                <span>15+ Counties</span>
                <span className="text-border">•</span>
                <span>100+ Pharmacies</span>
              </div>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className="relative animate-fade-in animation-delay-200">
            <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-elegant)]">
              <img
                src={heroImage}
                alt="Kenya map with AI disease surveillance data visualization showing network of health monitoring points"
                className="w-full h-auto"
              />
              {/* Overlay gradient for better integration */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
            </div>
            
            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-lg backdrop-blur-sm animate-scale-in animation-delay-400">
              <div className="text-2xl font-bold text-primary">94.7%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>

            <div className="absolute -top-6 -right-6 bg-card border border-border rounded-xl p-4 shadow-lg backdrop-blur-sm animate-scale-in animation-delay-600">
              <div className="text-2xl font-bold text-accent">14 Days</div>
              <div className="text-sm text-muted-foreground">Early Warning</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
