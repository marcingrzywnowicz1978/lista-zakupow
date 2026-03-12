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
    <main className="min-h-screen bg-gray-50">
      <div className="bg-green-600 px-4 pt-12 pb-6">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <p className="text-green-200 text-sm">Cześć, {user?.displayName?.split(" ")[0]} 👋</p>
            <h1 className="text-2xl font-bold text-white">Moje Listy</h1>
          </div>
          <button onClick={() => signOut(auth)} className="bg-green-700 text-white text-sm px-3 py-2 rounded-xl">Wyloguj</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="flex gap-2 mb-6">
          <input
            value={nowaLista}
            onChange={e => setNowaLista(e.target.value)}
            onKeyDown={e => e.key === "Enter" && dodajListe()}
            placeholder="Nazwa nowej listy..."
            className="flex-1 bg-white border-0 rounded-2xl px-4 py-4 text-base shadow-md outline-none focus:ring-2 focus:ring-green-500"
          />
          <button onClick={dodajListe} className="bg-green-600 text-white w-14 h-14 rounded-2xl font-bold text-2xl shadow-md flex items-center justify-center active:scale-95 transition-transform">+</button>
        </div>

        <div className="space-y-3">
          {listy.map(lista => (
            <div key={lista.id} onClick={() => router.push(`/listy/${lista.id}`)}
              className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer active:scale-98 transition-transform border border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛒</span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">{lista.nazwa}</h2>
                  <p className="text-sm text-gray-400">{lista.wlasciciel}</p>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </div>
            </div>
          ))}
          {listy.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-gray-400 text-lg">Brak list. Utwórz pierwszą!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
