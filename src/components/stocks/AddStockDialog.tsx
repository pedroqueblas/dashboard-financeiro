import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { financeApi } from "@/services/financeApi";
import { toast } from "sonner";

interface AddStockDialogProps {
  onAdd: (stock: any) => Promise<void>;
}

export function AddStockDialog({ onAdd }: AddStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate ticker
      const quote = await financeApi.getQuote(ticker.toUpperCase());
      if (!quote) {
        toast.error("Ticker não encontrado. Verifique o código.");
        setLoading(false);
        return;
      }

      await onAdd({
        ticker: ticker.toUpperCase(),
        quantity: Number(quantity),
        averagePrice: Number(price),
        date: new Date().toISOString()
      });

      setOpen(false);
      setTicker("");
      setQuantity("");
      setPrice("");
    } catch (error) {
        console.error(error);
      toast.error("Erro ao adicionar ação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Nova Ação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Ação à Carteira</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticker">Ticker (Código)</Label>
            <Input 
              id="ticker" 
              placeholder="Ex: PETR4" 
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input 
              id="quantity" 
              type="number" 
              placeholder="Ex: 100" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço Médio de Compra (R$)</Label>
            <Input 
              id="price" 
              type="number" 
              placeholder="Ex: 34.50" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="0.01"
              min="0"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Validando..." : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
