import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { StockPosition } from "@/types";
import { toast } from "sonner";

export function useStocks() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<StockPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStocks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "stocks"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StockPosition[];
      setStocks(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching stocks:", error);
      toast.error("Erro ao carregar carteira de ações.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const addStock = async (stock: Omit<StockPosition, "id">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "stocks"), stock);
      toast.success("Ação adicionada à carteira!");
    } catch (error) {
      console.error("Error adding stock:", error);
      toast.error("Erro ao adicionar ação.");
    }
  };

  const deleteStock = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "stocks", id));
      toast.success("Ação removida da carteira!");
    } catch (error) {
      console.error("Error deleting stock:", error);
      toast.error("Erro ao remover ação.");
    }
  };

  return { stocks, loading, addStock, deleteStock };
}
