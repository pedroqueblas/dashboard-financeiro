"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useInvestments } from "@/hooks/useInvestments";
import { MonthSelector } from "./MonthSelector";
import { SummaryCards } from "./SummaryCards";
import { OverviewCharts } from "./OverviewCharts";
import { TransactionList } from "./TransactionList";
import { TransactionDialog } from "./TransactionDialog";
import { InvestmentDialog } from "./InvestmentDialog";
import { format, isSameMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ModeToggle } from "../ui/mode-toggle";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockMarketOverview } from "../stocks/StockMarketOverview";
import { StockPortfolio } from "../stocks/StockPortfolio";
import { FinancialGoals } from "./FinancialGoals";

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthKey = format(currentMonth, "yyyy-MM");

  const { transactions, loading: loadingTrans, addTransaction, deleteTransaction } = useTransactions(monthKey);
  const { investments, loading: loadingInv, addInvestment, withdrawInvestment, deleteInvestment } = useInvestments();

  // Calculations
  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalInvested = investments.reduce((acc, i) => acc + i.amount, 0);

    // Calculate investments made in this specific month (for flow calculation)
    // Note: This assumes investment date matches the month.
    // If investments are "global" but we want to subtract from this month's income:
    const monthlyInvestments = investments
      .filter(i => isSameMonth(new Date(i.date), currentMonth))
      .reduce((acc, i) => acc + i.amount, 0);
      
    // User logic: Income - Expenses - Investments
    // But typically Balance is Income - Expenses. 
    // If we consider Investment as an "Expense" for cash flow:
    // We can show "Saldo Final" = Income - Expenses - MonthlyInvested.
    // For now, I'll pass income/expenses/invested to cards.
    // I'll adjust SummaryCards to accept monthlyInvested if needed.
    // Let's stick to standard: Income, Expense, Balance (Income-Expense), Total Invested.
    // And maybe a "Fluxo de Caixa" chart.

    return { income, expenses, totalInvested, monthlyInvestments };
  }, [transactions, investments, currentMonth]);

  if (loadingTrans || loadingInv) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground">Bem-vindo, {user?.email}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-900/50 p-1 rounded-lg backdrop-blur-sm border border-gray-200 dark:border-gray-800">
          <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Finanças Pessoais</TabsTrigger>
          <TabsTrigger value="goals">Metas & Objetivos</TabsTrigger>
          <TabsTrigger value="stocks">Mercado de Ações</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          {/* Summary Cards */}
          <SummaryCards 
            income={summary.income} 
            expenses={summary.expenses} 
            invested={summary.totalInvested} 
          />

          {/* Actions */}
          <div className="flex gap-4">
            <TransactionDialog onAddTransaction={addTransaction} />
            <InvestmentDialog 
              investments={investments} 
              onAddInvestment={addInvestment} 
              onWithdrawInvestment={withdrawInvestment} 
            />
          </div>

          {/* Charts & Lists */}
          <div className="grid gap-4 md:grid-cols-7">
            <div className="col-span-4">
              <OverviewCharts transactions={transactions} investments={investments} />
            </div>
            <div className="col-span-3">
              <TransactionList transactions={transactions} onDelete={deleteTransaction} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <FinancialGoals />
        </TabsContent>

        <TabsContent value="stocks" className="space-y-4">
          <StockMarketOverview />
          <StockPortfolio />
        </TabsContent>
      </Tabs>
    </div>
  );
}
