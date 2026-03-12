"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, collection, addDoc, onSnapshot, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

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
  do_kupienia: { label: "Do kupienia", kolor: "bg-gray-100 text-gray-600", next: "w_trakcie" },
  w_trakcie: { label: "W trakcie", kolor: "bg-yellow-100 text-yellow-700", next: "kupione" },
  kupione: { label: "Kupione", kolor: "bg-green-100 text-green-700", next: "do_kupienia" },
};

export default function ListaZakupow() {
  const { id } = useParams();
  const router = useRouter();
  const [produkty, setProdukty] = useState<Produkt[]>([]);
  const [lista, setLista] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [nowyProdukt, setNowyProdukt] = useState("");
  const [kategoria, setKategoria] = useState("Inne");
  const [ilosc, setIlosc] = useState(1);
  const [jednostka, setJednostka] = useState("szt.");
  const [cena, setCena] = useState("");
  const [pokazForm, setPokazForm] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) { router.push("/"); return; }
      setUser(u);
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
    if (nowa <= 0) { await deleteDoc(doc(db, "listy", id as string, "produkty", p.id)); return; }
    await updateDoc(doc(db, "listy", id as string, "produkty", p.id), { ilosc: nowa });
  };

  const sumaCena = produkty.reduce((s, p) => s + (p.cena * p.ilosc), 0);
  const kupioneCena = produkty.filter(p => p.status === "kupione").reduce((s, p) => s + (p.cena * p.ilosc), 0);
  const grupy = produkty.reduce((acc, p) => {
    if (!acc[p.kategoria]) acc[p.kategoria] = [];
    acc[p.kategoria].push(p); return acc;
  }, {} as Record<string, Produkt[]>);

  return (
    <main className="min-h-screen bg-green-50 pb-32">
      <div className="bg-green-700 text-white p-4 flex items-center gap-3">
        <button onClick={() => router.push("/listy")} className="text-2xl">←</button>
        <h1 className="text-xl font-bold flex-1">{lista?.nazwa}</h1>
      </div>

      {sumaCena > 0 && (
        <div className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow flex justify-between">
          <div><p className="text-xs text-gray-400">Łącznie</p><p className="font-bold text-lg">{sumaCena.toFixed(2)} zł</p></div>
          <div><p className="text-xs text-gray-400">Kupione</p><p className="font-bold text-lg text-green-600">{kupioneCena.toFixed(2)} zł</p></div>
          <div><p className="text-xs text-gray-400">Pozostało</p><p className="font-bold text-lg text-orange-500">{(sumaCena - kupioneCena).toFixed(2)} zł</p></div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {Object.entries(grupy).map(([kat, prod]) => (
          <div key={kat}>
            <h2 className="text-xs font-bold text-gray-400 uppercase mb-2">{kat}</h2>
            <div className="space-y-2">
              {prod.map(p => (
                <div key={p.id} className={`bg-white rounded-2xl shadow p-3 ${p.status === "kupione" ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => zmienStatus(p)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${STATUSY[p.status].kolor}`}>
                      {STATUSY[p.status].label}
                    </button>
                    <span className={`flex-1 font-medium ${p.status === "kupione" ? "line-through" : ""}`}>{p.nazwa}</span>
                    {p.cena > 0 && <span className="text-xs text-gray-400">{(p.cena * p.ilosc).toFixed(2)} zł</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => zmienIlosc(p, -1)} className="w-8 h-8 bg-gray-100 rounded-lg font-bold text-lg flex items-center justify-center">−</button>
                    <span className="font-semibold">{p.ilosc} {p.jednostka}</span>
                    <button onClick={() => zmienIlosc(p, 1)} className="w-8 h-8 bg-gray-100 rounded-lg font-bold text-lg flex items-center justify-center">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {pokazForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-3 max-w-lg mx-auto">
            <h2 className="font-bold text-lg">Dodaj produkt</h2>
            <input value={nowyProdukt} onChange={e => setNowyProdukt(e.target.value)} placeholder="Nazwa produktu *"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-green-500" />
            <select value={kategoria} onChange={e => setKategoria(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 outline-none">
              {["Pieczywo","Nabiał","Warzywa","Owoce","Mięso","Napoje","Chemia","Kosmetyki","Mrożonki","Sypkie","Inne"].map(k => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input type="number" value={ilosc} onChange={e => setIlosc(Number(e.target.value))} min={1}
                className="w-20 border rounded-xl px-3 py-3 outline-none" />
              <select value={jednostka} onChange={e => setJednostka(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-3 outline-none">
                {["szt.","opak.","kg","g","l","ml"].map(j => <option key={j}>{j}</option>)}
              </select>
              <input type="number" value={cena} onChange={e => setCena(e.target.value)} placeholder="Cena zł"
                className="w-24 border rounded-xl px-3 py-3 outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPokazForm(false)} className="flex-1 py-3 rounded-xl border font-semibold">Anuluj</button>
              <button onClick={dodajProdukt} className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold">Dodaj</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setPokazForm(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white w-16 h-16 rounded-full text-3xl shadow-xl flex items-center justify-center hover:bg-green-700">
        +
      </button>
    </main>
  );
}
