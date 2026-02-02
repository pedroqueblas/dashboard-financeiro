"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Investment } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface InvestmentDialogProps {
  investments: Investment[];
  onAddInvestment: (investment: any) => Promise<void>;
  onWithdrawInvestment: (id: string, currentAmount: number, withdrawAmount: number) => Promise<void>;
}

export function InvestmentDialog({ investments, onAddInvestment, onWithdrawInvestment }: InvestmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("invest");
  
  // Add state
  const [name, setName] = useState("");
  const [type, setType] = useState("fixed");
  const [amount, setAmount] = useState("");

  // Withdraw state
  const [selectedInvestmentId, setSelectedInvestmentId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onAddInvestment({
      name,
      type,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
    });
    setLoading(false);
    setOpen(false);
    setName("");
    setAmount("");
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const investment = investments.find(i => i.id === selectedInvestmentId);
    if (investment) {
      await onWithdrawInvestment(selectedInvestmentId, investment.amount, parseFloat(withdrawAmount));
    }
    setLoading(false);
    setOpen(false);
    setSelectedInvestmentId("");
    setWithdrawAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Gerenciar Investimentos</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Investimentos</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="invest" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invest">Investir</TabsTrigger>
            <TabsTrigger value="withdraw">Resgatar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="invest">
            <form onSubmit={handleAdd} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Investimento</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Tesouro Direto" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Renda Fixa</SelectItem>
                    <SelectItem value="variable">Renda Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Investir"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="withdraw">
            <form onSubmit={handleWithdraw} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Selecione o Investimento</Label>
                <Select value={selectedInvestmentId} onValueChange={setSelectedInvestmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {investments.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.name} ({formatCurrency(inv.amount)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedInvestmentId && (
                <div className="space-y-2">
                  <Label>Valor do Resgate</Label>
                  <Input type="number" step="0.01" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required />
                  <p className="text-xs text-muted-foreground">
                    Disponível: {formatCurrency(investments.find(i => i.id === selectedInvestmentId)?.amount || 0)}
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading || !selectedInvestmentId}>
                {loading ? "Processando..." : "Resgatar"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
