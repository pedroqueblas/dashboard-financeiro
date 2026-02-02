import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface SummaryCardsProps {
  income: number;
  expenses: number;
  invested: number;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
  hover: {
    y: -5,
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
    transition: {
      duration: 0.3,
    },
  },
};

export function SummaryCards({
  income,
  expenses,
  invested,
}: SummaryCardsProps) {
  const balance = income - expenses;

  const cards = [
    {
      title: "Receita Total",
      icon: ArrowUpIcon,
      value: income,
      color: "text-green-500",
      valueColor: "text-green-600",
      subtext: "No mês selecionado",
    },
    {
      title: "Despesas",
      icon: ArrowDownIcon,
      value: expenses,
      color: "text-red-500",
      valueColor: "text-red-600",
      subtext: "No mês selecionado",
    },
    {
      title: "Saldo (Disponível)",
      icon: DollarSign,
      value: balance,
      color: "text-blue-500",
      valueColor: balance >= 0 ? "text-blue-600" : "text-red-600",
      subtext: "Receita - Despesas",
    },
    {
      title: "Investimentos",
      icon: Wallet,
      value: invested,
      color: "text-purple-500",
      valueColor: "text-purple-600",
      subtext: "Total acumulado",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          custom={index}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={cardVariants}
        >
          <Card className="overflow-hidden border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div
                className={`p-2 rounded-full bg-opacity-10 ${card.color.replace(
                  "text-",
                  "bg-"
                )}`}
              >
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <motion.div
                className={`text-2xl font-bold ${card.valueColor}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.2 + index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                {formatCurrency(card.value)}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtext}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
