import { StockQuote } from "@/types";

const BASE_URL = "https://brapi.dev/api";
// Use a free token if available, otherwise rely on free tier limits
// The public token 'public' works for some endpoints on brapi, or we can omit it for limited access
const TOKEN = "public"; 

export const financeApi = {
  async getQuote(ticker: string): Promise<StockQuote | null> {
    try {
      const response = await fetch(`${BASE_URL}/quote/${ticker}?token=${TOKEN}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error("Error fetching quote:", error);
      return null;
    }
  },

  async getQuotes(tickers: string[]): Promise<StockQuote[]> {
    try {
      // Chunking requests to avoid 401 Unauthorized on large batches/URL length
      const chunkSize = 3; 
      const chunks = [];
      for (let i = 0; i < tickers.length; i += chunkSize) {
        chunks.push(tickers.slice(i, i + chunkSize));
      }

      const results: StockQuote[] = [];

      // Execute chunks in parallel (or sequential if rate limit is tight)
      await Promise.all(chunks.map(async (chunk) => {
        try {
           // Try without token first as per test
           const tickerString = chunk.join(',');
           // Try with public token first, if fails try without? 
           // Tests showed NO token works better for batches sometimes, but let's stick to simple first.
           // Actually tests showed small batch works without token.
           const response = await fetch(`${BASE_URL}/quote/${tickerString}?token=${TOKEN}`);
           
           if (!response.ok) {
             console.warn(`Batch failed for ${tickerString}: ${response.status}`);
             return;
           }

           const data = await response.json();
           if (data.results) {
             results.push(...data.results);
           }
        } catch (e) {
          console.error("Chunk fetch error", e);
        }
      }));
      
      return results;
    } catch (error) {
      console.error("Error fetching quotes:", error);
      return [];
    }
  },

  async getMarketHighlights(): Promise<{ 
    gainers: StockQuote[], 
    losers: StockQuote[], 
    fiis: StockQuote[] 
  }> {
    try {
      // Use the /quote/list endpoint which is more reliable for lists
      const [stocksResponse, fundsResponse] = await Promise.all([
        fetch(`${BASE_URL}/quote/list?sortBy=change&sortOrder=desc&limit=20&type=stock`),
        fetch(`${BASE_URL}/quote/list?sortBy=change&sortOrder=desc&limit=10&type=fund`)
      ]);

      const stocksData = await stocksResponse.json();
      const fundsData = await fundsResponse.json();

      const mapToQuote = (item: any): StockQuote => ({
        symbol: item.stock,
        shortName: item.name,
        longName: item.name,
        currency: "BRL",
        regularMarketPrice: item.close,
        regularMarketDayHigh: item.close, // List API doesn't give High/Low, use close as proxy or fetch detail if needed
        regularMarketDayLow: item.close,
        regularMarketDayRange: "",
        regularMarketChange: item.change, // This might be percent or value? Usually percent in list
        regularMarketChangePercent: item.change,
        regularMarketTime: new Date().toISOString(),
        marketCap: item.market_cap || 0,
        volume: item.volume,
        regularMarketVolume: item.volume,
        regularMarketPreviousClose: 0,
        regularMarketOpen: 0,
        averageDailyVolume3Month: 0,
        averageDailyVolume10Day: 0,
        fiftyTwoWeekLow: 0,
        fiftyTwoWeekHigh: 0,
        priceEarnings: 0,
        earningsPerShare: 0,
        logourl: item.logo
      });

      const allStocks = (stocksData.stocks || []).map(mapToQuote);
      const fiis = (fundsData.stocks || []).map(mapToQuote);

      // Filter gainers and losers
      const gainers = allStocks.filter((s: StockQuote) => s.regularMarketChangePercent > 0).slice(0, 5);
      const losers = [...allStocks]
        .sort((a: StockQuote, b: StockQuote) => a.regularMarketChangePercent - b.regularMarketChangePercent)
        .slice(0, 5);

      return {
        gainers,
        losers,
        fiis
      };
    } catch (error) {
      console.error("Error fetching market highlights:", error);
      return { gainers: [], losers: [], fiis: [] };
    }
  },

  async getTopStocks(): Promise<StockQuote[]> {
    const { gainers } = await this.getMarketHighlights();
    return gainers;
  },
  
  // Helper to calculate potential returns
  calculateReturn(currentPrice: number, averagePrice: number, quantity: number) {
    const totalInvested = averagePrice * quantity;
    const currentValue = currentPrice * quantity;
    const profit = currentValue - totalInvested;
    const profitPercent = (profit / totalInvested) * 100;
    
    return {
      totalInvested,
      currentValue,
      profit,
      profitPercent
    };
  }
};
