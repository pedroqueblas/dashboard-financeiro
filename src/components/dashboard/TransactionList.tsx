import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  return (
    <Card className="border-none shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhuma transação neste mês.</p>
          )}
          <AnimatePresence mode="popLayout">
            {transactions.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                    {t.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{t.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(t.date), "dd/MM")} • {t.category === 'Renda' ? (t.isFixed ? 'Renda Fixa' : `Renda Variável (Semana ${t.week})`) : t.category}
                      {t.paymentMethod && (
                        <>
                          {' • '}
                          {t.paymentMethod === 'credit' ? 'Crédito' : t.paymentMethod === 'debit' ? 'Débito' : 'Pix'}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
