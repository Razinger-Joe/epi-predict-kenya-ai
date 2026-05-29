import { Calendar, Map, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Calendar,
    title: "14-21 Day Advance Warning",
    description: "Predict disease outbreaks 2-3 weeks before they peak. Give your team time to prepare resources, stock medications, and alert staff.",
    badge: ">95% Accuracy",
  },
  {
    icon: Map,
    title: "Built for Kenya",
    description: "Trained on Kenyan disease patterns. Understands Swahili and Sheng. Monitors all 47 counties with local context.",
    badge: "47 Counties Covered",
  },
  {
    icon: TrendingUp,
    title: "Save Time & Money",
    description: "Reduce emergency overcrowding by 30-40%. Prevent medication stockouts. Save KSh 2-5M annually per facility.",
    badge: "KSh 50M+ Saved",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          Why Healthcare Leaders Choose EpiPredict
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border bg-card"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <Badge className="bg-primary text-primary-foreground">
                  {feature.badge}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
