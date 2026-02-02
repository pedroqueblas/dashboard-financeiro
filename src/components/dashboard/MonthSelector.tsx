import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  return (
    <div className="flex items-center space-x-4">
      <Button variant="outline" size="icon" onClick={() => onMonthChange(subMonths(currentMonth, 1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-xl font-bold capitalize min-w-[150px] text-center">
        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
      </div>
      <Button variant="outline" size="icon" onClick={() => onMonthChange(addMonths(currentMonth, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
