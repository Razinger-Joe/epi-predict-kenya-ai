import { Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-card-foreground mb-2">EpiPredict Kenya</h3>
            <p className="text-muted-foreground text-sm">
              Disease Prediction for a Healthier Tomorrow
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-3">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="mailto:hello@epipredict.co.ke" className="text-muted-foreground hover:text-primary transition-colors">Contact: hello@epipredict.co.ke</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-3">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:hello@epipredict.co.ke" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © 2025 EpiPredict. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
