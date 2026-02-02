import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  type: 'monthly' | 'total'; // monthly goal or total savings goal
  category: 'emergency' | 'fixed_income' | 'variable_income' | 'other';
  deadline?: string;
  createdAt: any;
}

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "users", user.uid, "goals"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FinancialGoal[];
      
      setGoals(goalsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    await addDoc(collection(db, "users", user.uid, "goals"), {
      ...goal,
      createdAt: new Date()
    });
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "goals", id);
    await updateDoc(docRef, updates);
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "goals", id);
    await deleteDoc(docRef);
  };

  const updateGoalProgress = async (id: string, amount: number) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "goals", id);
    await updateDoc(docRef, { currentAmount: amount });
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress
  };
}
