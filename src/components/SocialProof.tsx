const logos = [
  "Kenyatta National Hospital",
  "Aga Khan Hospital",
  "Goodlife Pharmacy",
  "Nairobi County Health",
  "Mombasa County Health",
  "Coast General Hospital",
];

const SocialProof = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
          Trusted by Kenya's Leading Healthcare Institutions
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-24 bg-muted rounded-lg border border-border hover:border-primary transition-colors"
            >
              <span className="text-muted-foreground font-medium text-center px-4">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
