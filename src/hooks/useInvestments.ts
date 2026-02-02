import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Investment } from "@/types";
import { toast } from "sonner";

export function useInvestments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "investments"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Investment[];
      console.log("Investimentos atualizados:", data);
      setInvestments(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching investments:", error);
      toast.error("Erro ao carregar investimentos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const addInvestment = async (investment: Omit<Investment, "id">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "investments"), investment);
      toast.success("Investimento adicionado!");
    } catch (error) {
      console.error("Error adding investment:", error);
      toast.error("Erro ao adicionar investimento.");
    }
  };

  const withdrawInvestment = async (id: string, currentAmount: number, withdrawAmount: number) => {
    if (!user) return;
    try {
      if (withdrawAmount >= currentAmount) {
        // Full withdrawal, delete document
        await deleteDoc(doc(db, "users", user.uid, "investments", id));
        toast.success("Investimento resgatado totalmente!");
      } else {
        // Partial withdrawal, update amount
        await updateDoc(doc(db, "users", user.uid, "investments", id), {
          amount: currentAmount - withdrawAmount
        });
        toast.success("Resgate parcial realizado!");
      }
    } catch (error) {
      console.error("Error withdrawing investment:", error);
      toast.error("Erro ao resgatar investimento.");
    }
  };

  const deleteInvestment = async (id: string) => {
     if (!user) return;
     try {
       await deleteDoc(doc(db, "users", user.uid, "investments", id));
       toast.success("Investimento removido!");
     } catch (error) {
       console.error("Error deleting investment:", error);
       toast.error("Erro ao remover investimento.");
     }
  };

  return { investments, loading, addInvestment, withdrawInvestment, deleteInvestment };
}
