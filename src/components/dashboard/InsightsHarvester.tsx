import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Upload,
    Sparkles,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    TrendingUp,
    MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Insight {
    id: string;
    source: string;
    content: string;
    county: string;
    disease_indicators: string[];
    severity_score: number;
    status: "pending" | "analyzing" | "analyzed" | "verified";
    harvested_at: string;
}

const statusConfig = {
    pending: { icon: Clock, color: "bg-yellow-500", label: "Pending", textColor: "text-yellow-600" },
    analyzing: { icon: Loader2, color: "bg-blue-500", label: "Analyzing", textColor: "text-blue-600" },
    analyzed: { icon: AlertCircle, color: "bg-orange-500", label: "Analyzed", textColor: "text-orange-600" },
    verified: { icon: CheckCircle2, color: "bg-green-500", label: "Verified", textColor: "text-green-600" },
};

export const InsightsHarvester = () => {
    const [isHarvesting, setIsHarvesting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [harvestProgress, setHarvestProgress] = useState(0);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    // Simulate harvesting social media insights
    const handleHarvest = useCallback(async () => {
        setIsHarvesting(true);
        setHarvestProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setHarvestProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock insights data
        const mockInsights: Insight[] = [
            {
                id: "ins-001",
                source: "Twitter/X",
                content: "Multiple malaria cases reported in Kisumu county. Local clinics seeing surge in patients with fever symptoms.",
                county: "Kisumu",
                disease_indicators: ["malaria"],
                severity_score: 75,
                status: "pending",
                harvested_at: new Date().toISOString()
            },
            {
                id: "ins-002",
                source: "Facebook",
                content: "Health workers in Turkana distributing mosquito nets. Malaria prevention campaign ongoing.",
                county: "Turkana",
                disease_indicators: ["malaria"],
                severity_score: 45,
                status: "pending",
                harvested_at: new Date().toISOString()
            },
            {
                id: "ins-003",
                source: "WhatsApp Groups",
                content: "Water quality concerns in Mombasa coastal areas. Residents reporting stomach issues.",
                county: "Mombasa",
                disease_indicators: ["cholera", "typhoid"],
                severity_score: 68,
                status: "pending",
                harvested_at: new Date().toISOString()
            },
            {
                id: "ins-004",
                source: "Local Forums",
                content: "Flu outbreak in Nairobi schools. Many students absent due to respiratory illness.",
                county: "Nairobi",
                disease_indicators: ["flu"],
                severity_score: 52,
                status: "pending",
                harvested_at: new Date().toISOString()
            }
        ];

        setInsights(mockInsights);
        setIsHarvesting(false);

        toast({
            title: "Harvest Complete",
            description: `Found ${mockInsights.length} insights from social media sources`,
        });
    }, [toast]);

    // Handle file upload
    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.pdf')) {
            toast({
                title: "Invalid File",
                description: "Please upload a PDF file",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);

        // Simulate upload and parsing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newInsight: Insight = {
            id: `pdf-${Date.now()}`,
            source: "PDF Report",
            content: `Health report "${file.name}" uploaded and analyzed. Contains verified social media sentiment data from health operators.`,
            county: "Multi-County",
            disease_indicators: ["malaria", "cholera"],
            severity_score: 62,
            status: "analyzed",
            harvested_at: new Date().toISOString()
        };

        setInsights(prev => [newInsight, ...prev]);
        setIsUploading(false);

        toast({
            title: "Report Uploaded",
            description: `${file.name} processed successfully`,
        });

        // Reset file input
        e.target.value = '';
    }, [toast]);

    // Handle verification checkbox
    const handleVerify = useCallback((insightId: string, checked: boolean) => {
        setVerifiedIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(insightId);
            } else {
                newSet.delete(insightId);
            }
            return newSet;
        });

        // Update insight status
        setInsights(prev => prev.map(insight => {
            if (insight.id === insightId) {
                return { ...insight, status: checked ? "verified" : "analyzed" };
            }
            return insight;
        }));

        if (checked) {
            toast({
                title: "Insight Verified ✓",
                description: "This insight will be used for disease predictions",
            });
        }
    }, [toast]);

    const getSeverityColor = (score: number) => {
        if (score >= 70) return "text-red-500";
        if (score >= 50) return "text-orange-500";
        return "text-green-500";
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Social Media Insights Harvester
                    </CardTitle>
                    <CardDescription className="text-base">
                        Harvest health insights from social media or upload verified PDF reports from health operators
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {/* Harvest Button */}
                        <Button
                            onClick={handleHarvest}
                            disabled={isHarvesting}
                            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                        >
                            {isHarvesting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Harvesting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Harvest Social Insights
                                </>
                            )}
                        </Button>

                        {/* PDF Upload */}
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                            <Button variant="outline" disabled={isUploading}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload PDF Report
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Harvest Progress */}
                    {isHarvesting && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Scanning social media sources...</span>
                                <span className="font-medium">{harvestProgress}%</span>
                            </div>
                            <Progress value={harvestProgress} className="h-2" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Insights List */}
            {insights.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Harvested Insights
                            </span>
                            <Badge variant="secondary">{insights.length} insights</Badge>
                        </CardTitle>
                        <CardDescription>
                            Review and verify insights before they are used for predictions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {insights.map((insight) => {
                            const StatusIcon = statusConfig[insight.status].icon;
                            const isVerified = verifiedIds.has(insight.id);

                            return (
                                <div
                                    key={insight.id}
                                    className={`p-4 rounded-lg border transition-all ${isVerified
                                            ? 'bg-green-500/5 border-green-500/20'
                                            : 'bg-muted/30 border-border hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Verification Checkbox */}
                                        <div className="pt-1">
                                            <Checkbox
                                                id={`verify-${insight.id}`}
                                                checked={isVerified}
                                                onCheckedChange={(checked) => handleVerify(insight.id, checked as boolean)}
                                                className="h-5 w-5"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    {insight.source}
                                                </Badge>
                                                <Badge variant="outline" className="gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {insight.county}
                                                </Badge>
                                                {insight.disease_indicators.map((disease) => (
                                                    <Badge key={disease} className="capitalize">
                                                        {disease}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <p className="text-sm text-foreground">{insight.content}</p>

                                            <div className="flex items-center gap-4 text-sm">
                                                <span className={`flex items-center gap-1 ${statusConfig[insight.status].textColor}`}>
                                                    <StatusIcon className={`h-4 w-4 ${insight.status === 'analyzing' ? 'animate-spin' : ''}`} />
                                                    {statusConfig[insight.status].label}
                                                </span>
                                                <span className={`flex items-center gap-1 ${getSeverityColor(insight.severity_score)}`}>
                                                    <TrendingUp className="h-4 w-4" />
                                                    Severity: {insight.severity_score}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
