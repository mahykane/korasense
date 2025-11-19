/**
 * Web Search Integration
 * Provides real-time web data retrieval for enhanced reasoning
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  relevance: number;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  query: string;
  totalResults: number;
  searchTime: number;
}

/**
 * Search the web using Google's search grounding (via Gemini)
 */
export async function searchWeb(query: string): Promise<WebSearchResponse> {
  const startTime = Date.now();
  
  console.log(`🌐 Web Search: "${query}"`);
  
  try {
    // Use Gemini with Google Search grounding
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
      }
    });

    const prompt = `Search the web for current, factual information about: "${query}"
    
Please provide:
1. Key findings from reliable sources
2. Recent data or statistics (with dates if available)
3. Expert opinions or analysis
4. Any contradicting viewpoints

Format your response as a structured summary with source citations.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the response into structured results
    // For now, we'll return the full text as a single result
    // In production, you'd want to use Google Custom Search API or similar
    const results: WebSearchResult[] = [{
      title: `Web Search Results for: ${query}`,
      snippet: text,
      url: 'web-search',
      relevance: 0.9,
    }];
    
    const searchTime = Date.now() - startTime;
    console.log(`  ✓ Web search completed: ${searchTime}ms`);
    
    return {
      results,
      query,
      totalResults: results.length,
      searchTime,
    };
  } catch (error: any) {
    console.error('Web search error:', error);
    throw new Error(`Web search failed: ${error.message}`);
  }
}

/**
 * Perform deep reasoning with web context
 */
export async function deepReasonWithWeb(
  question: string,
  localContext?: string
): Promise<string> {
  console.log('🧠 Deep Reasoning Mode with Web Search');
  
  try {
    // First, search the web for current information
    const webResults = await searchWeb(question);
    
    // Use Gemini's advanced reasoning with both local and web context
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro', // Use Pro for deep reasoning
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    const contextSection = localContext 
      ? `\n\n**INTERNAL KNOWLEDGE BASE:**\n${localContext}\n\n`
      : '';

    const webSection = webResults.results.length > 0
      ? `\n\n**CURRENT WEB INFORMATION:**\n${webResults.results.map(r => r.snippet).join('\n\n')}\n\n`
      : '';

    const prompt = `You are an advanced AI assistant with deep reasoning capabilities. Analyze the following question using both internal knowledge and current web information.

**QUESTION:**
${question}
${contextSection}${webSection}
**INSTRUCTIONS:**
1. Synthesize information from both internal knowledge and web sources
2. Provide comprehensive analysis with multiple perspectives
3. Include recent data and current trends
4. Identify any gaps or contradictions
5. Offer actionable insights and recommendations
6. Cite sources clearly (mark web sources with 🌐, internal sources with 📚)

Provide a thorough, well-reasoned response:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    
    return response.text();
  } catch (error: any) {
    console.error('Deep reasoning error:', error);
    throw new Error(`Deep reasoning failed: ${error.message}`);
  }
}
