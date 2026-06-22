import { GoogleGenAI } from '@google/genai';
import FirecrawlApp from '@mendable/firecrawl-js';
import { MarketItem } from './types';

// Initialize Gemini
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Initialize Firecrawl
const firecrawl = process.env.FIRECRAWL_API_KEY ? new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY }) : null;

export async function curateRecommendations(markets: MarketItem[], profile: any): Promise<MarketItem[]> {
  if (!ai) {
    console.warn("Gemini API Key missing. Returning uncurated markets.");
    return markets.slice(0, 6);
  }

  // A real implementation would:
  // 1. Calculate profile interest_score, skill_score, engagement_score
  // 2. Filter markets by explicit interests and inferred interests
  // 3. Ask Gemini to rank them and provide a rationale

  const prompt = `
    You are an expert Prediction Market analyst.
    Given a list of markets and a user profile, select the top 3-6 markets that best fit the user's interests.
    For each selected market, provide a short 1-2 sentence rationale for why it was selected.
    
    User Profile:
    ${JSON.stringify(profile)}
    
    Available Markets:
    ${JSON.stringify(markets.map(m => ({ id: m.id, title: m.title, category: m.category }))) }
    
    Return a JSON array of objects with { id: string, rationale: string }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) return markets.slice(0, 6);
    
    const curatedData: {id: string, rationale: string}[] = JSON.parse(resultText);
    
    const curatedMarkets = curatedData.map(c => {
      const market = markets.find(m => m.id === c.id);
      if (market) {
        return { ...market, rationale: c.rationale };
      }
      return null;
    }).filter(Boolean) as MarketItem[];

    return curatedMarkets.length > 0 ? curatedMarkets : markets.slice(0, 6);
  } catch (err) {
    console.error("Gemini curation failed:", err);
    return markets.slice(0, 6);
  }
}

export async function getMarketSemanticMatches(marketA: MarketItem, marketB: MarketItem): Promise<{ isMatch: boolean, confidence: number, rationale: string }> {
  if (!ai) return { isMatch: false, confidence: 0, rationale: "Gemini API missing" };

  const prompt = `
    Compare these two prediction markets and determine if they resolve based on the same or highly correlated underlying event.
    
    Market A: ${marketA.title} (${marketA.category})
    Market B: ${marketB.title} (${marketB.category})
    
    Return a JSON object: { "isMatch": boolean, "confidence": number (0-1), "rationale": "short explanation" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) throw new Error("No response");
    return JSON.parse(response.text);
  } catch (err) {
    console.error("Semantic match failed:", err);
    return { isMatch: false, confidence: 0, rationale: "Error processing match" };
  }
}

export async function gatherMarketContextWithFirecrawl(query: string): Promise<string> {
  if (!firecrawl) return "Firecrawl API key missing.";
  
  try {
    // Perform a web scrape or search using Firecrawl
    const scrapeResult = await firecrawl.scrapeUrl(query, { formats: ['markdown'] });
    if (!scrapeResult.success) {
      return `Failed to scrape: ${scrapeResult.error}`;
    }
    return scrapeResult.markdown || "No content found.";
  } catch (err) {
    console.error("Firecrawl failed:", err);
    return "Error gathering context.";
  }
}
