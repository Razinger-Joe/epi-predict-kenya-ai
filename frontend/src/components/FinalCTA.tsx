import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FinalCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary-hover">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Ready to Stay Ahead of Disease Outbreaks?
        </h2>
        <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Join 50+ healthcare facilities using EpiPredict to protect their communities
        </p>
        
        <Button 
          asChild
          size="lg"
          className="bg-background text-primary hover:bg-background/90 font-semibold"
        >
          <Link to="/signup">Start Your Free 90-Day Pilot</Link>
        </Button>
        
        <p className="text-sm text-primary-foreground/70 mt-4">
          No credit card required • Setup in 5 minutes • Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
