import { useEffect, useState, useMemo } from "react";
import { useStocks } from "@/hooks/useStocks";
import { financeApi } from "@/services/financeApi";
import { AddStockDialog } from "./AddStockDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StockPortfolio() {
  const { stocks, loading: loadingStocks, addStock, deleteStock } = useStocks();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    async function loadPrices() {
      if (stocks.length === 0) return;
      setLoadingPrices(true);
      try {
        const uniqueTickers = Array.from(new Set(stocks.map(s => s.ticker)));
        const quotes = await financeApi.getQuotes(uniqueTickers);
        const priceMap: Record<string, number> = {};
        quotes.forEach(q => {
          priceMap[q.symbol] = q.regularMarketPrice;
        });
        setPrices(priceMap);
      } catch (error) {
        console.error("Error updating prices", error);
      } finally {
        setLoadingPrices(false);
      }
    }

    loadPrices();
  }, [stocks]);

  const portfolioSummary = useMemo(() => {
    let totalInvested = 0;
    let currentValue = 0;

    stocks.forEach(stock => {
      totalInvested += stock.quantity * stock.averagePrice;
      const price = prices[stock.ticker] || stock.averagePrice; // Fallback to buy price if no live data
      currentValue += stock.quantity * price;
    });

    const profit = currentValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    return { totalInvested, currentValue, profit, profitPercent };
  }, [stocks, prices]);

  if (loadingStocks) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {portfolioSummary.totalInvested.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {portfolioSummary.currentValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro/Prejuízo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolioSummary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {portfolioSummary.profit.toFixed(2)} ({portfolioSummary.profitPercent.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Minhas Ações</h2>
        <AddStockDialog onAdd={addStock} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Preço Médio</TableHead>
              <TableHead>Preço Atual</TableHead>
              <TableHead>Total Investido</TableHead>
              <TableHead>Valor Atual</TableHead>
              <TableHead>Rendimento</TableHead>
              <TableHead>Projeção (1 Ano)*</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                  Nenhuma ação cadastrada. Adicione sua primeira ação!
                </TableCell>
              </TableRow>
            ) : (
              stocks.map((stock) => {
                const currentPrice = prices[stock.ticker] || stock.averagePrice;
                const invested = stock.quantity * stock.averagePrice;
                const current = stock.quantity * currentPrice;
                const gain = current - invested;
                const gainPercent = (gain / invested) * 100;
                
                // Simple projection: Historical market avg ~10% per year + current gain
                const projected = current * 1.10;

                return (
                  <TableRow key={stock.id}>
                    <TableCell className="font-medium">{stock.ticker}</TableCell>
                    <TableCell>{stock.quantity}</TableCell>
                    <TableCell>R$ {stock.averagePrice.toFixed(2)}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1">
                            R$ {currentPrice.toFixed(2)}
                            {loadingPrices && <span className="text-xs text-muted-foreground animate-pulse">...</span>}
                        </div>
                    </TableCell>
                    <TableCell>R$ {invested.toFixed(2)}</TableCell>
                    <TableCell>R$ {current.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={gain >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {gainPercent > 0 ? "+" : ""}{gainPercent.toFixed(2)}%
                      </span>
                    </TableCell>
                     <TableCell className="text-muted-foreground">
                        R$ {projected.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteStock(stock.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">* Projeção estimada com base em crescimento médio de 10% a.a.</p>
    </div>
  );
}
