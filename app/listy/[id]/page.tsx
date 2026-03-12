"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, collection, addDoc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";

type Status = "do_kupienia" | "w_trakcie" | "kupione";

interface Produkt {
  id: string;
  nazwa: string;
  kategoria: string;
  ilosc: number;
  jednostka: string;
  cena: number;
  status: Status;
}

const STATUSY = {
  do_kupienia: { emoji: "⬜", kolor: "bg-gray-100 text-gray-500", next: "w_trakcie" as Status },
  w_trakcie: { emoji: "🔄", kolor: "bg-yellow-100 text-yellow-700", next: "kupione" as Status },
  kupione: { emoji: "✅", kolor: "bg-green-100 text-green-700", next: "do_kupienia" as Status },
};

const KATEGORIE = ["Pieczywo","Nabiał","Warzywa","Owoce","Mięso","Napoje","Chemia","Kosmetyki","Mrożonki","Sypkie","Inne"];
const JEDNOSTKI = ["szt.","opak.","kg","g","l","ml"];

export default function ListaZakupow() {
  const { id } = useParams();
  const router = useRouter();
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [lista, setLista] = useState<any>(null);
  const [nowyProdukt, setNowyProdukt] = useState("");
  const [kategoria, setKategoria] = useState("Inne");
  const [ilosc, setIlosc] = useState(1);
  const [jednostka, setJednostka] = useState("szt.");
  const [cena, setCena] = useState("");
  const [pokazForm, setPokazForm] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) router.push("/");
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "listy", id as string), (d) => {
      setLista({ id: d.id, ...d.data() });
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(collection(db, "listy", id as string, "produkty"), (snap) => {
      setProdukty(snap.docs.map(d => ({ id: d.id, ...d.data() } as Produkt)));
    });
    return unsub;
  }, [id]);

  const dodajProdukt = async () => {
    if (!nowyProdukt.trim()) return;
    const istnieje = produkty.find(p => p.nazwa.toLowerCase() === nowyProdukt.toLowerCase());
    if (istnieje) {
      await updateDoc(doc(db, "listy", id as string, "produkty", istnieje.id), { ilosc: istnieje.ilosc + ilosc });
    } else {
      await addDoc(collection(db, "listy", id as string, "produkty"), {
        nazwa: nowyProdukt.trim(), kategoria, ilosc, jednostka,
        cena: cena ? parseFloat(cena) : 0, status: "do_kupienia",
      });
    }
    setNowyProdukt(""); setIlosc(1); setCena(""); setPokazForm(false);
  };

  const zmienStatus = async (p: Produkt) => {
    await updateDoc(doc(db, "listy", id as string, "produkty", p.id), {
      status: STATUSY[p.status].next,
    });
  };

  const zmienIlosc = async (p: Produkt, delta: number) => {
    const nowa = p.ilosc + delta;
    if (nowa <= 0) {
      await deleteDoc(doc(db, "listy", id as string, "produkty", p.id));
      return;
    }
    await updateDoc(doc(db, "listy", id as string, "produkty", p.id), { ilosc: nowa });
  };

  const suma = produkty.reduce((s, p) => s + (p.cena * p.ilosc), 0);
  const kupione = produkty.filter(p => p.status === "kupione");
  const grupy = produkty.reduce((acc, p) => {
    if (!acc[p.kategoria]) acc[p.kategoria] = [];
    acc[p.kategoria].push(p); return acc;
  }, {} as Record<string, Produkt[]>);

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-green-600 px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => router.push("/listy")} className="text-white text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-green-700">‹</button>
          <h1 className="text-xl font-bold text-white flex-1">{lista?.nazwa}</h1>
        </div>
        {suma > 0 && (
          <div className="max-w-lg mx-auto mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Łącznie", value: suma, color: "text-white" },
              { label: "Kupione", value: kupione.reduce((s,p) => s + p.cena * p.ilosc, 0), color: "text-green-200" },
              { label: "Pozostało", value: suma - kupione.reduce((s,p) => s + p.cena * p.ilosc, 0), color: "text-yellow-200" },
            ].map(item => (
              <div key={item.label} className="bg-green-700 rounded-xl p-2 text-center">
                <p className="text-green-300 text-xs">{item.label}</p>
                <p className={`font-bold text-sm ${item.color}`}>{item.value.toFixed(2)} zł</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {Object.entries(grupy).map(([kat, prod]) => (
          <div key={kat}>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{kat}</h2>
            <div className="space-y-2">
              {prod.map(p => (
                <div key={p.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-opacity ${p.status === "kupione" ? "opacity-40" : ""}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => zmienStatus(p)} className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 active:scale-90 transition-transform">
                      {STATUSY[p.status].emoji}
                    </button>
                    <span className={`flex-1 font-medium text-gray-800 ${p.status === "kupione" ? "line-through text-gray-400" : ""}`}>{p.nazwa}</span>
                    {p.cena > 0 && <span className="text-sm text-gray-400 font-medium">{(p.cena * p.ilosc).toFixed(2)} zł</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-3 ml-13">
                    <button onClick={() => zmienIlosc(p, -1)} className="w-9 h-9 bg-gray-100 rounded-xl font-bold text-lg flex items-center justify-center active:scale-90 transition-transform">−</button>
                    <span className="font-semibold text-gray-700 min-w-16 text-center">{p.ilosc} {p.jednostka}</span>
                    <button onClick={() => zmienIlosc(p, 1)} className="w-9 h-9 bg-gray-100 rounded-xl font-bold text-lg flex items-center justify-center active:scale-90 transition-transform">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {produkty.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-400 text-lg">Lista jest pusta</p>
            <p className="text-gray-300">Dodaj pierwszy produkt</p>
          </div>
        )}
      </div>

      {pokazForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setPokazForm(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <h2 className="font-bold text-xl text-gray-800">Dodaj produkt</h2>
            <input
              value={nowyProdukt}
              onChange={e => setNowyProdukt(e.target.value)}
              placeholder="Nazwa produktu *"
              autoFocus
              className="w-full border border-gray-200 rounded-2xl px-4 py-4 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
            <select value={kategoria} onChange={e => setKategoria(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-green-500 text-gray-700">
              {KATEGORIE.map(k => <option key={k}>{k}</option>)}
            </select>
            <div className="flex gap-2">
              <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 flex-1">
                <button onClick={() => setIlosc(Math.max(1, ilosc-1))} className="w-10 h-12 flex items-center justify-center text-xl font-bold text-gray-500">−</button>
                <span className="flex-1 text-center font-semibold">{ilosc}</span>
                <button onClick={() => setIlosc(ilosc+1)} className="w-10 h-12 flex items-center justify-center text-xl font-bold text-gray-500">+</button>
              </div>
              <select value={jednostka} onChange={e => setJednostka(e.target.value)}
                className="border border-gray-200 rounded-2xl px-3 py-4 outline-none focus:border-green-500 text-gray-700">
                {JEDNOSTKI.map(j => <option key={j}>{j}</option>)}
              </select>
              <input type="number" value={cena} onChange={e => setCena(e.target.value)} placeholder="Cena zł"
                className="w-24 border border-gray-200 rounded-2xl px-3 py-4 outline-none focus:border-green-500 text-center" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPokazForm(false)} className="flex-1 py-4 rounded-2xl border border-gray-200 font-semibold text-gray-600 active:scale-95 transition-transform">Anuluj</button>
              <button onClick={dodajProdukt} className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-semibold shadow-lg active:scale-95 transition-transform">Dodaj</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setPokazForm(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white w-16 h-16 rounded-full text-3xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40">
        +
      </button>
    </main>
  );
}
