"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";

interface Lista {
  id: string;
  nazwa: string;
  wlasciciel: string;
  uzytkownicy: string[];
  dataUtworzenia: any;
}

export default function Listy() {
  const [listy, setListy] = useState<Lista[]>([]);
  const [nowaLista, setNowaLista] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) { router.push("/"); return; }
      setUser(u);
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "listy"), where("uzytkownicy", "array-contains", user.email));
    const unsub = onSnapshot(q, (snap) => {
      setListy(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lista)));
    });
    return unsub;
  }, [user]);

  const dodajListe = async () => {
    if (!nowaLista.trim() || !user) return;
    await addDoc(collection(db, "listy"), {
      nazwa: nowaLista.trim(),
      wlasciciel: user.email,
      uzytkownicy: [user.email],
      dataUtworzenia: serverTimestamp(),
    });
    setNowaLista("");
  };

  return (
    <main className="min-h-screen bg-green-50 p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">🛒 Moje Listy</h1>
        <button onClick={() => signOut(auth)} className="text-sm text-gray-400 hover:text-gray-600">Wyloguj</button>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={nowaLista}
          onChange={e => setNowaLista(e.target.value)}
          onKeyDown={e => e.key === "Enter" && dodajListe()}
          placeholder="Nazwa nowej listy..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-green-500"
        />
        <button onClick={dodajListe} className="bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-xl hover:bg-green-700">+</button>
      </div>

      <div className="space-y-3">
        {listy.map(lista => (
          <div key={lista.id} onClick={() => router.push(`/listy/${lista.id}`)}
            className="bg-white rounded-2xl shadow p-4 cursor-pointer hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800">{lista.nazwa}</h2>
            <p className="text-sm text-gray-400 mt-1">Właściciel: {lista.wlasciciel}</p>
          </div>
        ))}
        {listy.length === 0 && (
          <p className="text-center text-gray-400 mt-10">Brak list. Utwórz pierwszą!</p>
        )}
      </div>
    </main>
  );
}
