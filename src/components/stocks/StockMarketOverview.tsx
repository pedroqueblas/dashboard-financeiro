import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockQuote } from "@/types";
import { financeApi } from "@/services/financeApi";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StockMarketOverview() {
  const [marketData, setMarketData] = useState<{ gainers: StockQuote[], losers: StockQuote[], fiis: StockQuote[] }>({ gainers: [], losers: [], fiis: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarketData() {
      try {
        const data = await financeApi.getMarketHighlights();
        setMarketData(data);
      } catch (error) {
        console.error("Failed to load market data", error);
      } finally {
        setLoading(false);
      }
    }

    loadMarketData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <div className="col-span-3 space-y-4">
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    );
  }

  const chartData = marketData.gainers.slice(0, 5).map(stock => ({
    name: stock.symbol,
    Alta: stock.regularMarketDayHigh,
    Baixa: stock.regularMarketDayLow,
    Preço: stock.regularMarketPrice
  }));

  const topFii = marketData.fiis.length > 0 ? marketData.fiis[0] : null;
  const topLoser = marketData.losers.length > 0 ? marketData.losers[0] : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Variação Diária (Top 5 Altas)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, '']}
                  labelStyle={{ color: 'black' }}
                />
                <Legend />
                <Bar dataKey="Baixa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Alta" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Destaques do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.gainers.slice(0, 5).map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">{stock.symbol}</p>
                      <p className="text-sm text-muted-foreground">{stock.shortName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {stock.regularMarketPrice.toFixed(2)}</p>
                    <p className="text-sm text-green-600">
                      +{stock.regularMarketChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fundo Imobiliário em Alta</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                {topFii ? (
                    <>
                        <div className="text-2xl font-bold">{topFii.symbol}</div>
                        <p className="text-xs text-muted-foreground mb-1">
                            {topFii.shortName}
                        </p>
                        <p className={`text-sm font-medium ${topFii.regularMarketChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {topFii.regularMarketChangePercent > 0 ? '+' : ''}{topFii.regularMarketChangePercent.toFixed(2)}% hoje
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Preço: R$ {topFii.regularMarketPrice.toFixed(2)}
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Dados indisponíveis</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Oportunidade (Maior Baixa)</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                {topLoser ? (
                    <>
                         <div className="text-2xl font-bold">{topLoser.symbol}</div>
                        <p className="text-xs text-muted-foreground mb-1">
                            {topLoser.shortName}
                        </p>
                        <p className="text-sm font-medium text-red-600">
                            {topLoser.regularMarketChangePercent.toFixed(2)}% hoje
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Preço: R$ {topLoser.regularMarketPrice.toFixed(2)}
                        </p>
                    </>
                ) : (
                     <p className="text-sm text-muted-foreground">Dados indisponíveis</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dica do Investidor</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mt-2">
                    "Compre ao som dos canhões e venda ao som dos violinos." 
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    - Warren Buffett
                </p>
                <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium">Monitoramento:</p>
                    <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-secondary px-2 py-1 rounded">IBOV</span>
                        <span className="text-xs bg-secondary px-2 py-1 rounded">IFIX</span>
                        <span className="text-xs bg-secondary px-2 py-1 rounded">CDI</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
