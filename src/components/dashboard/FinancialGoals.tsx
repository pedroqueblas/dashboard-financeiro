import { useState } from "react";
import { Plus, Target, TrendingUp, ShieldAlert, Coins } from "lucide-react";
import { useGoals, FinancialGoal } from "@/hooks/useGoals";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export function FinancialGoals() {
  const { goals, loading, addGoal, updateGoalProgress, deleteGoal } = useGoals();
  const [isOpen, setIsOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    name: string;
    targetAmount: string;
    category: string;
    type: string;
  }>({
    name: "",
    targetAmount: "",
    category: "fixed_income",
    type: "total"
  });

  const handleCreateGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await addGoal({
        name: newGoal.name,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: 0,
        category: newGoal.category as any,
        type: newGoal.type as any
      });
      toast.success("Meta criada com sucesso!");
      setIsOpen(false);
      setNewGoal({ name: "", targetAmount: "", category: "fixed_income", type: "total" });
    } catch (error) {
      toast.error("Erro ao criar meta");
    }
  };

  const handleUpdateProgress = async (goal: FinancialGoal, amountStr: string) => {
    const amount = Number(amountStr);
    if (isNaN(amount)) return;
    
    // Add to current amount (simple simulation for now, ideally would be transaction linked)
    // For this UI, let's just set the new total or add? 
    // Let's assume the user is updating the "Current Total Saved"
    // Or adding a contribution? Let's make it "Update Total" for simplicity
    try {
      await updateGoalProgress(goal.id, amount);
      toast.success("Progresso atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar progresso");
    }
  };

  if (loading) {
    return <div>Carregando metas...</div>;
  }

  const monthlyGoals = goals.filter(g => g.type === 'monthly');
  const longTermGoals = goals.filter(g => g.type === 'total');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Metas Financeiras</h2>
          <p className="text-muted-foreground">
            Defina objetivos e acompanhe sua evolução patrimonial.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
              <DialogDescription>
                Defina um objetivo financeiro para acompanhar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  placeholder="Ex: Reserva de Emergência, Aposentadoria..."
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor Alvo (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 10000"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Meta</Label>
                <Select
                  value={newGoal.type}
                  onValueChange={(val) => setNewGoal({ ...newGoal, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Investimento Mensal (Recorrente)</SelectItem>
                    <SelectItem value="total">Objetivo Total (Acumulado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={newGoal.category}
                  onValueChange={(val) => setNewGoal({ ...newGoal, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Reserva de Emergência</SelectItem>
                    <SelectItem value="fixed_income">Renda Fixa</SelectItem>
                    <SelectItem value="variable_income">Renda Variável</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateGoal}>Criar Meta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dicas e Incentivos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-green-700 dark:text-green-400">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Reserva de Emergência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Idealmente, tenha de 6 a 12 meses do seu custo de vida guardados em liquidez diária (CDB, Tesouro Selic).
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-blue-700 dark:text-blue-400">
              <Target className="mr-2 h-4 w-4" />
              Meta Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Tente investir pelo menos 20% da sua renda mensal. Comece com pouco, mas seja constante!
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-purple-700 dark:text-purple-400">
              <TrendingUp className="mr-2 h-4 w-4" />
              Diversificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Não coloque todos os ovos na mesma cesta. Misture Renda Fixa e Variável conforme seu perfil.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metas Mensais */}
      {monthlyGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Coins className="mr-2 h-5 w-5 text-yellow-500" />
            Metas Mensais
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {monthlyGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onUpdate={handleUpdateProgress}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Objetivos de Longo Prazo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Target className="mr-2 h-5 w-5 text-primary" />
          Objetivos de Longo Prazo
        </h3>
        {longTermGoals.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-muted-foreground">Nenhum objetivo de longo prazo definido ainda.</p>
            <Button variant="link" onClick={() => setIsOpen(true)}>Criar primeiro objetivo</Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {longTermGoals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onUpdate={handleUpdateProgress}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GoalCard({ goal, onUpdate, onDelete }: { 
  goal: FinancialGoal; 
  onUpdate: (goal: FinancialGoal, val: string) => void;
  onDelete: (id: string) => void;
}) {
  const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const [editValue, setEditValue] = useState("");

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{goal.name}</CardTitle>
            <CardDescription className="text-xs capitalize">{goal.category.replace('_', ' ')}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => onDelete(goal.id)}>
            <span className="sr-only">Delete</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm mb-1">
          <span>R$ {goal.currentAmount.toLocaleString()}</span>
          <span className="text-muted-foreground">de R$ {goal.targetAmount.toLocaleString()}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="flex items-center space-x-2 pt-2">
          <Input 
            type="number" 
            placeholder="Atualizar valor..." 
            className="h-8 text-xs"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8"
            onClick={() => {
              if (editValue) {
                onUpdate(goal, editValue);
                setEditValue("");
              }
            }}
          >
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
