import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  where,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/types";
import { toast } from "sonner";
import { format, addMonths } from "date-fns";

export function useTransactions(month: string) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !month) {
      // Avoid calling setState synchronously in effect if possible, or ensure it's safe
      // Here we just return early, but we might want to clear transactions if user/month changes to null
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "users", user.uid, "months", month, "transactions"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];
        console.log("Transações atualizadas:", data);
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching transactions:", error);
        toast.error("Erro ao carregar transações.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, month]); // Added user dependency

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) return;
    try {
      const transactionDate = new Date(transaction.date);

      if (
        transaction.paymentMethod === "credit" &&
        transaction.installments &&
        transaction.installments > 1
      ) {
        const installmentAmount = Number(
          (transaction.amount / transaction.installments).toFixed(2)
        );

        const promises = [];
        for (let i = 0; i < transaction.installments; i++) {
          const currentInstallmentDate = addMonths(transactionDate, i);

          const transactionMonth = format(currentInstallmentDate, "yyyy-MM");

          const installmentTransaction = {
            ...transaction,
            amount: installmentAmount,
            date: currentInstallmentDate.toISOString(),
            currentInstallment: i + 1,
            description: `${transaction.description} (${i + 1}/${
              transaction.installments
            })`,
          };

          promises.push(
            addDoc(
              collection(
                db,
                "users",
                user.uid,
                "months",
                transactionMonth,
                "transactions"
              ),
              installmentTransaction
            )
          );
        }
        await Promise.all(promises);
      } else {
        const transactionMonth = format(transactionDate, "yyyy-MM");
        await addDoc(
          collection(
            db,
            "users",
            user.uid,
            "months",
            transactionMonth,
            "transactions"
          ),
          transaction
        );
      }

      toast.success("Transação adicionada!");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error(
        "Erro ao adicionar transação: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      );
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(
        doc(db, "users", user.uid, "months", month, "transactions", id)
      );
      toast.success("Transação removida!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao remover transação.");
    }
  };

  return { transactions, loading, addTransaction, deleteTransaction };
}
