/**
 * Mock Social Media Insights Service
 * 
 * Simulates early warning signals from social media for MVP demonstration.
 * In production, this would connect to Twitter/X API, news aggregators, etc.
 */

export interface SocialInsight {
    id: string;
    source: 'twitter' | 'facebook' | 'news' | 'community_reports';
    county: string;
    keywords: string[];
    sentiment: 'negative' | 'neutral' | 'positive';
    mentionCount: number;
    samplePost: string;
    detectedAt: Date;
    riskIndicator: 'low' | 'medium' | 'high';
}

export interface TrendAnalysis {
    county: string;
    period: string;
    totalMentions: number;
    topKeywords: { keyword: string; count: number }[];
    riskLevel: 'low' | 'medium' | 'high';
    insights: SocialInsight[];
    summary: string;
}

// Kenya counties for realistic simulation
const KENYAN_COUNTIES = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kiambu',
    'Machakos', 'Nyeri', 'Meru', 'Kakamega', 'Bungoma', 'Kisii'
];

// Disease-related keywords we "monitor"
const SYMPTOM_KEYWORDS = [
    'fever', 'diarrhea', 'vomiting', 'cough', 'headache', 'rash',
    'malaria', 'cholera', 'typhoid', 'flu', 'sick', 'hospital',
    'outbreak', 'epidemic', 'cases', 'spreading', 'infected'
];

// Sample posts for realistic demonstration
const SAMPLE_POSTS: Record<string, string[]> = {
    malaria: [
        "My neighbor's kids all have high fever, 3rd case this week in our estate 😰",
        "Mosquitoes are everywhere after the rains. Already 5 malaria cases in our village",
        "Local clinic overwhelmed with malaria patients. @MOaborHealth please help",
        "Warning to Kisumu residents - malaria cases rising rapidly in Nyalenda",
    ],
    cholera: [
        "Water in our area has been brown for days. Many people with stomach issues",
        "Breaking: Multiple diarrhea cases reported at Kibera. Residents advised to boil water",
        "My whole family is sick after drinking tap water. This is serious!",
        "County government please fix our water! People are getting cholera symptoms",
    ],
    typhoid: [
        "Prolonged fever cases increasing in Mathare. Please get tested folks",
        "Local hospital says typhoid cases doubled this month. Stay safe everyone",
        "Food poisoning or typhoid? 10 students sick at local school",
    ],
    respiratory: [
        "Everyone coughing on the matatu today. Wear your masks people!",
        "Flu season hitting hard. Half my office is out sick",
        "TB awareness needed - seeing too many chronic cough cases unchecked",
    ],
};

/**
 * Generate a random mock insight
 */
function generateMockInsight(county?: string, disease?: string): SocialInsight {
    const selectedCounty = county || KENYAN_COUNTIES[Math.floor(Math.random() * KENYAN_COUNTIES.length)];
    const diseaseType = disease || ['malaria', 'cholera', 'typhoid', 'respiratory'][Math.floor(Math.random() * 4)];
    const posts = SAMPLE_POSTS[diseaseType] || SAMPLE_POSTS.malaria;

    const mentionCount = Math.floor(Math.random() * 500) + 50;
    const riskIndicator = mentionCount > 300 ? 'high' : mentionCount > 150 ? 'medium' : 'low';

    return {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source: ['twitter', 'facebook', 'news', 'community_reports'][Math.floor(Math.random() * 4)] as SocialInsight['source'],
        county: selectedCounty,
        keywords: SYMPTOM_KEYWORDS.slice(0, Math.floor(Math.random() * 5) + 2),
        sentiment: riskIndicator === 'high' ? 'negative' : riskIndicator === 'medium' ? 'neutral' : 'positive',
        mentionCount,
        samplePost: posts[Math.floor(Math.random() * posts.length)],
        detectedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
        riskIndicator,
    };
}

/**
 * Get social media trend analysis for a county
 */
export function getCountyTrends(county: string): TrendAnalysis {
    const insights: SocialInsight[] = [];
    const insightCount = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < insightCount; i++) {
        insights.push(generateMockInsight(county));
    }

    const totalMentions = insights.reduce((sum, i) => sum + i.mentionCount, 0);
    const highRiskCount = insights.filter(i => i.riskIndicator === 'high').length;

    // Aggregate keywords
    const keywordCounts: Record<string, number> = {};
    insights.forEach(insight => {
        insight.keywords.forEach(kw => {
            keywordCounts[kw] = (keywordCounts[kw] || 0) + insight.mentionCount;
        });
    });

    const topKeywords = Object.entries(keywordCounts)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const riskLevel = highRiskCount >= 2 ? 'high' : highRiskCount >= 1 ? 'medium' : 'low';

    const summaries: Record<string, string> = {
        high: `⚠️ ALERT: Elevated social media activity detected in ${county}. ${totalMentions} mentions of disease-related keywords in the last 24 hours. Top concerns: ${topKeywords.slice(0, 3).map(k => k.keyword).join(', ')}. Community reports suggest potential outbreak developing.`,
        medium: `📊 Moderate activity in ${county}. ${totalMentions} health-related mentions detected. Keywords trending: ${topKeywords.slice(0, 2).map(k => k.keyword).join(', ')}. Recommend continued monitoring.`,
        low: `✅ Normal activity levels in ${county}. ${totalMentions} routine health mentions. No significant concerns detected from social signals.`,
    };

    return {
        county,
        period: 'Last 24 hours',
        totalMentions,
        topKeywords,
        riskLevel,
        insights,
        summary: summaries[riskLevel],
    };
}

/**
 * Get national overview of social media signals
 */
export function getNationalOverview(): { counties: TrendAnalysis[]; hotspots: string[] } {
    const counties = KENYAN_COUNTIES.slice(0, 6).map(county => getCountyTrends(county));
    const hotspots = counties
        .filter(c => c.riskLevel === 'high')
        .map(c => c.county);

    return { counties, hotspots };
}

/**
 * Format insights for AI context
 */
export function formatInsightsForAI(county: string): string {
    const trends = getCountyTrends(county);

    return `
## Social Media Early Warning Analysis for ${county}
- **Period**: ${trends.period}
- **Total Mentions**: ${trends.totalMentions}
- **Risk Level**: ${trends.riskLevel.toUpperCase()}
- **Top Keywords**: ${trends.topKeywords.map(k => `${k.keyword} (${k.count})`).join(', ')}

### Sample Community Reports:
${trends.insights.slice(0, 3).map(i => `- "${i.samplePost}" [${i.source}, ${i.mentionCount} similar mentions]`).join('\n')}

### Summary:
${trends.summary}
`.trim();
}
