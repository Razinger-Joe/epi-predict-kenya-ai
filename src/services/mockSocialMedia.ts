/**
 * Social Media Data Service
 * 
 * Connects to real backend API for live Twitter/X data,
 * with mock fallback for development/offline mode.
 * 
 * Phase 1: Twitter/X via twikit (free)
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ═══════════════════════════════════════════════════════════════════════════════
// Interfaces (enhanced with real data fields)
// ═══════════════════════════════════════════════════════════════════════════════

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

export interface SocialSignal {
    id: string;
    signal_type: string;
    content: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'urgent';
    location: string | null;
    disease_mentioned: string | null;
    source: string;
    timestamp: string;
    engagement_score: number;
    platform_id: string | null;
    author_handle: string | null;
    url: string | null;
    is_verified_source: boolean;
    data_source: 'twitter_live' | 'facebook_live' | 'grok_live' | 'mock';
    ai_classification?: {
        severity?: number;
        confidence?: number;
        disease_confirmed?: boolean;
        notes?: string;
        classified_by?: string;
    } | null;
}

export interface SentimentScore {
    positive: number;
    negative: number;
    neutral: number;
    urgent: number;
    overall_label: string;
}

export interface SocialSignalResponse {
    signals: SocialSignal[];
    total_count: number;
    aggregate_sentiment: SentimentScore;
    sources: string[];
    harvest_mode: string;
}

export interface HarvestStatus {
    twitter: {
        platform: string;
        status: string;
        installed: boolean;
        credentials_configured: boolean;
        authenticated: boolean;
    };
    facebook: {
        platform: string;
        status: string;
        installed: boolean;
        credentials_configured: boolean;
        authenticated: boolean;
        pages_configured?: number;
    };
    grok: {
        platform: string;
        status: string;
        installed: boolean;
        credentials_configured: boolean;
        authenticated: boolean;
        model?: string;
    };
    harvest_mode: string;
    overall_status: string;
}

export interface HarvestResult {
    success: boolean;
    signals_collected: number;
    sources_queried: string[];
    errors: string[];
    message: string;
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

// ═══════════════════════════════════════════════════════════════════════════════
// Real API calls (connect to backend)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch social signals from the backend API.
 * Backend handles hybrid mode (real Twitter + mock fallback).
 */
export async function getSocialSignals(
    county?: string,
    disease?: string,
    source?: string,
    limit: number = 20
): Promise<SocialSignalResponse> {
    try {
        const params = new URLSearchParams();
        if (county) params.set('county', county);
        if (disease) params.set('disease', disease);
        if (source) params.set('source', source);
        params.set('limit', String(limit));

        const response = await fetch(`${API_URL}/api/v1/social/signals?${params}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn('Social API unavailable, using local mock:', error);
        return getLocalMockResponse(county);
    }
}

/**
 * Check the harvest connection status.
 */
export async function getHarvestStatus(): Promise<HarvestStatus> {
    try {
        const response = await fetch(`${API_URL}/api/v1/social/status`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return {
            twitter: {
                platform: 'Twitter/X',
                status: 'api_unreachable',
                installed: false,
                credentials_configured: false,
                authenticated: false,
            },
            facebook: {
                platform: 'Facebook',
                status: 'api_unreachable',
                installed: false,
                credentials_configured: false,
                authenticated: false,
            },
            grok: {
                platform: 'Grok xAI',
                status: 'api_unreachable',
                installed: false,
                credentials_configured: false,
                authenticated: false,
            },
            harvest_mode: 'mock',
            overall_status: 'offline',
        };
    }
}

/**
 * Trigger a manual harvest run.
 */
export async function triggerHarvest(
    county?: string,
    disease?: string
): Promise<HarvestResult> {
    try {
        const params = new URLSearchParams();
        if (county) params.set('county', county);
        if (disease) params.set('disease', disease);

        const response = await fetch(`${API_URL}/api/v1/social/harvest?${params}`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return {
            success: false,
            signals_collected: 0,
            sources_queried: [],
            errors: ['Backend API unreachable'],
            message: 'Harvest failed: backend offline',
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Local mock fallback (for when backend is offline)
// ═══════════════════════════════════════════════════════════════════════════════

const KENYAN_COUNTIES = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kisii',
    'Turkana', 'West Pokot', 'Garissa', 'Kakamega', 'Nyeri'
];

const SYMPTOM_KEYWORDS = [
    'fever', 'diarrhea', 'vomiting', 'cough', 'headache', 'rash',
    'malaria', 'cholera', 'typhoid', 'flu', 'sick', 'hospital',
    'outbreak', 'epidemic', 'cases', 'spreading', 'infected'
];

const SAMPLE_POSTS: Record<string, string[]> = {
    malaria: [
        "My neighbor's kids all have high fever, 3rd case this week in our estate 😰",
        "Mosquitoes are everywhere after the rains. Already 5 malaria cases in our village",
        "Local clinic overwhelmed with malaria patients. @MOH_Kenya please help",
    ],
    cholera: [
        "Water in our area has been brown for days. Many people with stomach issues",
        "Breaking: Multiple diarrhea cases reported at Kibera. Residents advised to boil water",
        "County government please fix our water! People are getting cholera symptoms",
    ],
    typhoid: [
        "Prolonged fever cases increasing in Mathare. Please get tested folks",
        "Local hospital says typhoid cases doubled this month. Stay safe everyone",
    ],
    respiratory: [
        "Everyone coughing on the matatu today. Wear your masks people!",
        "Flu season hitting hard. Half my office is out sick",
    ],
};

function getLocalMockResponse(county?: string): SocialSignalResponse {
    const signals: SocialSignal[] = [];
    const count = Math.floor(Math.random() * 5) + 5;

    for (let i = 0; i < count; i++) {
        const c = county || KENYAN_COUNTIES[Math.floor(Math.random() * KENYAN_COUNTIES.length)];
        const diseases = ['malaria', 'cholera', 'typhoid', 'respiratory'];
        const d = diseases[Math.floor(Math.random() * diseases.length)];
        const posts = SAMPLE_POSTS[d] || SAMPLE_POSTS.malaria;

        signals.push({
            id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            signal_type: 'tweet',
            content: posts[Math.floor(Math.random() * posts.length)],
            sentiment: ['negative', 'neutral', 'urgent'][Math.floor(Math.random() * 3)] as any,
            location: c,
            disease_mentioned: d,
            source: 'Twitter/X',
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            engagement_score: Math.round(Math.random() * 100) / 100,
            platform_id: null,
            author_handle: null,
            url: null,
            is_verified_source: false,
            data_source: 'mock',
        });
    }

    return {
        signals,
        total_count: signals.length,
        aggregate_sentiment: {
            positive: 0.1,
            negative: 0.5,
            neutral: 0.2,
            urgent: 0.2,
            overall_label: 'negative',
        },
        sources: ['mock'],
        harvest_mode: 'mock',
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Legacy functions (backward compatible with existing components)
// ═══════════════════════════════════════════════════════════════════════════════

function generateMockInsight(county?: string): SocialInsight {
    const selectedCounty = county || KENYAN_COUNTIES[Math.floor(Math.random() * KENYAN_COUNTIES.length)];
    const diseases = ['malaria', 'cholera', 'typhoid', 'respiratory'];
    const diseaseType = diseases[Math.floor(Math.random() * 4)];
    const posts = SAMPLE_POSTS[diseaseType] || SAMPLE_POSTS.malaria;
    const mentionCount = Math.floor(Math.random() * 500) + 50;

    return {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source: ['twitter', 'facebook', 'news', 'community_reports'][Math.floor(Math.random() * 4)] as SocialInsight['source'],
        county: selectedCounty,
        keywords: SYMPTOM_KEYWORDS.slice(0, Math.floor(Math.random() * 5) + 2),
        sentiment: mentionCount > 300 ? 'negative' : mentionCount > 150 ? 'neutral' : 'positive',
        mentionCount,
        samplePost: posts[Math.floor(Math.random() * posts.length)],
        detectedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        riskIndicator: mentionCount > 300 ? 'high' : mentionCount > 150 ? 'medium' : 'low',
    };
}

export function getCountyTrends(county: string): TrendAnalysis {
    const insights: SocialInsight[] = [];
    const insightCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < insightCount; i++) {
        insights.push(generateMockInsight(county));
    }

    const totalMentions = insights.reduce((sum, i) => sum + i.mentionCount, 0);
    const highRiskCount = insights.filter(i => i.riskIndicator === 'high').length;

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
        high: `⚠️ ALERT: Elevated social media activity detected in ${county}. ${totalMentions} mentions in last 24h.`,
        medium: `📊 Moderate activity in ${county}. ${totalMentions} health mentions. Continued monitoring recommended.`,
        low: `✅ Normal activity in ${county}. ${totalMentions} routine mentions. No concerns detected.`,
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

export function getNationalOverview(): { counties: TrendAnalysis[]; hotspots: string[] } {
    const counties = KENYAN_COUNTIES.slice(0, 6).map(county => getCountyTrends(county));
    const hotspots = counties.filter(c => c.riskLevel === 'high').map(c => c.county);
    return { counties, hotspots };
}

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
