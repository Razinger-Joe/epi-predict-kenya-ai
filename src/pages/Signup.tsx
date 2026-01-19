import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const organizationTypes = [
  "Hospital",
  "Pharmacy Chain",
  "County Health Department",
  "Research Institution",
];

const kenyanCounties = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans-Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">EpiPredict</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Start Your Free 90-Day Pilot</h1>
            <p className="text-muted-foreground mt-2">No credit card required</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i}
                </div>
                {i < 3 && <div className={`flex-1 h-1 mx-2 ${i < step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1 - Organization Info */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input id="org-name" placeholder="Kenyatta National Hospital" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-type">Organization Type *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">County/Location *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {kenyanCounties.map((county) => (
                        <SelectItem key={county} value={county.toLowerCase()}>{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilities">Number of Facilities</Label>
                  <Input id="facilities" type="number" placeholder="1" />
                </div>
              </>
            )}

            {/* Step 2 - Contact Info */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name *</Label>
                  <Input id="full-name" placeholder="Dr. John Doe" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="john.doe@hospital.co.ke" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" placeholder="+254 712 345 678" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input id="job-title" placeholder="Chief Medical Officer" />
                </div>
              </>
            )}

            {/* Step 3 - Account Setup */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    onChange={handlePasswordChange}
                    required
                  />
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < passwordStrength ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use 8+ characters with uppercase, numbers & symbols
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password *</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" required />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </Label>
                </div>
              </>
            )}

            <div className="flex gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1">
                {step === 3 ? "Create Account" : "Continue"}
                {step < 3 && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Testimonials */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-accent items-center justify-center p-12">
        <div className="text-primary-foreground space-y-8 max-w-md">
          <div className="space-y-4">
            <p className="text-lg italic">
              "EpiPredict helped us predict a dengue outbreak 18 days in advance. We were fully prepared when cases started rising."
            </p>
            <div>
              <p className="font-semibold">Dr. Sarah Kamau</p>
              <p className="text-sm text-primary-foreground/80">Chief Medical Officer, Nairobi General Hospital</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-primary-foreground/20">
            <div className="text-center">
              <div className="text-2xl font-bold">✓</div>
              <div className="text-sm mt-2">HIPAA Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">✓</div>
              <div className="text-sm mt-2">Kenya DPA Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">✓</div>
              <div className="text-sm mt-2">ISO 27001</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
