const BASE_URL = "https://brapi.dev/api";
const TOKEN = "public"; 

async function testApi() {
  const stockTickers = [
      "PETR4", "VALE3", "ITUB4", "BBDC4", "BBAS3", 
      "WEGE3", "RENT3", "MGLU3", "BHIA3", "PRIO3"
  ];
  const tickerString = stockTickers.join(',');
  const url = `${BASE_URL}/quote/${tickerString}?token=${TOKEN}`;
  
  console.log(`Fetching: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`Status: ${response.status}`);
    
    if (!response.ok) {
        console.error("Response not OK");
        const text = await response.text();
        console.error(text);
        return;
    }

    const data = await response.json();
    console.log("Data received:");
    if (data.results) {
        console.log(`Count: ${data.results.length}`);
        console.log("First item:", data.results[0]);
    } else {
        console.log("No results field:", data);
    }

  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testApi();
