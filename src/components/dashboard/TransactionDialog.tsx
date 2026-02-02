"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransactionDialogProps {
  onAddTransaction: (transaction: any) => Promise<void>;
}

export function TransactionDialog({
  onAddTransaction,
}: TransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [incomeType, setIncomeType] = useState("fixed"); // fixed or variable
  const [week, setWeek] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<
    "credit" | "debit" | "pix"
  >("debit");
  const [installments, setInstallments] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const transactionData: any = {
      type,
      description,
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      category: type === "expense" ? category : "Renda",
    };

    if (type === "expense") {
      transactionData.paymentMethod = paymentMethod;
      if (paymentMethod === "credit") {
        transactionData.installments = parseInt(installments);
      }
    }

    if (type === "income") {
      transactionData.isFixed = incomeType === "fixed";
      if (incomeType === "variable") {
        transactionData.week = parseInt(week);
      }
    }

    await onAddTransaction(transactionData);
    setLoading(false);
    setOpen(false);

    // Reset form
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("debit");
    setInstallments("1");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nova Transação</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Despesa</TabsTrigger>
            <TabsTrigger value="income">Receita</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <TabsContent value="expense" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  required={type === "expense"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Alimentação</SelectItem>
                    <SelectItem value="transport">Transporte</SelectItem>
                    <SelectItem value="housing">Moradia</SelectItem>
                    <SelectItem value="entertainment">Lazer</SelectItem>
                    <SelectItem value="health">Saúde</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v: "credit" | "debit" | "pix") =>
                    setPaymentMethod(v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Débito</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "credit" && (
                <div className="space-y-2">
                  <Label htmlFor="installments">Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    required
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="income" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Tipo de Renda</Label>
                <Select value={incomeType} onValueChange={setIncomeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixa (Salário)</SelectItem>
                    <SelectItem value="variable">Variável (Extra)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {incomeType === "variable" && (
                <div className="space-y-2">
                  <Label>Semana</Label>
                  <Select value={week} onValueChange={setWeek}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semana 1</SelectItem>
                      <SelectItem value="2">Semana 2</SelectItem>
                      <SelectItem value="3">Semana 3</SelectItem>
                      <SelectItem value="4">Semana 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
