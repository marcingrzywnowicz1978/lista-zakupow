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
  do_kupienia: { emoji: "⬜", next: "w_trakcie" as Status },
  w_trakcie: { emoji: "🔄", next: "kupione" as Status },
  kupione: { emoji: "✅", next: "do_kupienia" as Status },
};

const KATEGORIE = ["Pieczywo","Nabiał","Warzywa","Owoce","Mięso","Napoje","Chemia","Kosmetyki","Mrożonki","Sypkie","Inne"];
const KAT_EMOJI: Record<string,string> = {Pieczywo:"🍞",Nabiał:"🥛",Warzywa:"🥦",Owoce:"🍎",Mięso:"🥩",Napoje:"🥤",Chemia:"🧴",Kosmetyki:"💄",Mrożonki:"❄️",Sypkie:"🌾",Inne:"📦"};
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
    const unsub = auth.onAuthStateChanged((u) => { if (!u) router.push("/"); });
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
    await updateDoc(doc(db, "listy", id as string, "produkty", p.id), { status: STATUSY[p.status].next });
  };

  const zmienIlosc = async (p: Produkt, delta: number) => {
    const nowa = p.ilosc + delta;
    if (nowa <= 0) { await deleteDoc(doc(db, "listy", id as string, "produkty", p.id)); return; }
    await updateDoc(doc(db, "listy", id as string, "produkty", p.id), { ilosc: nowa });
  };

  const suma = produkty.reduce((s, p) => s + (p.cena * p.ilosc), 0);
  const kupione = produkty.filter(p => p.status === "kupione");
  const kupioneSuma = kupione.reduce((s, p) => s + p.cena * p.ilosc, 0);
  const progress = produkty.length > 0 ? Math.round((kupione.length / produkty.length) * 100) : 0;
  const grupy = produkty.reduce((acc, p) => {
    if (!acc[p.kategoria]) acc[p.kategoria] = [];
    acc[p.kategoria].push(p); return acc;
  }, {} as Record<string, Produkt[]>);

  return (
    <main style={{minHeight:"100vh",background:"#f7f7f7",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",paddingBottom:"100px"}}>
      <div style={{background:"white",padding:"48px 20px 0",borderBottom:"1px solid #f0f0f0"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px",maxWidth:"500px",margin:"0 auto 16px"}}>
          <button onClick={() => router.push("/listy")} style={{width:"36px",height:"36px",background:"#f5f5f5",border:"none",borderRadius:"12px",fontSize:"20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <h1 style={{fontSize:"20px",fontWeight:"800",color:"#1a1a1a",flex:1,letterSpacing:"-0.5px"}}>{lista?.nazwa}</h1>
        </div>

        <div style={{maxWidth:"500px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#aaa",marginBottom:"6px"}}>
            <span>{kupione.length} z {produkty.length} kupionych</span>
            <span>{progress}%</span>
          </div>
          <div style={{background:"#f0f0f0",borderRadius:"8px",height:"6px",marginBottom:"12px"}}>
            <div style={{background:"#2e7d32",height:"6px",borderRadius:"8px",width:`${progress}%`,transition:"width 0.3s"}}></div>
          </div>
        </div>

        {suma > 0 && (
          <div style={{maxWidth:"500px",margin:"0 auto 16px",background:"#1a1a1a",borderRadius:"16px",padding:"12px 16px",display:"flex",justifyContent:"space-between"}}>
            {[
              {label:"Łącznie",value:suma,color:"white"},
              {label:"Kupione",value:kupioneSuma,color:"#69f0ae"},
              {label:"Zostało",value:suma-kupioneSuma,color:"#ffd740"},
            ].map(item => (
              <div key={item.label} style={{textAlign:"center"}}>
                <div style={{fontSize:"10px",color:"#888",textTransform:"uppercase",letterSpacing:"0.5px"}}>{item.label}</div>
                <div style={{fontSize:"15px",fontWeight:"800",color:item.color}}>{item.value.toFixed(2)} zł</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{maxWidth:"500px",margin:"0 auto",padding:"16px"}}>
        {Object.entries(grupy).map(([kat, prod]) => (
          <div key={kat} style={{marginBottom:"16px"}}>
            <div style={{fontSize:"11px",fontWeight:"800",color:"#bbb",textTransform:"uppercase",letterSpacing:"1px",padding:"0 4px",marginBottom:"8px"}}>
              {KAT_EMOJI[kat] || "📦"} {kat}
            </div>
            {prod.map(p => (
              <div key={p.id} style={{background:"white",borderRadius:"16px",padding:"12px 14px",display:"flex",alignItems:"center",gap:"10px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",marginBottom:"8px",opacity:p.status==="kupione"?0.4:1,transition:"opacity 0.2s"}}>
                <button onClick={() => zmienStatus(p)} style={{width:"38px",height:"38px",background:"#f5f5f5",border:"none",borderRadius:"12px",fontSize:"20px",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {STATUSY[p.status].emoji}
                </button>
                <div style={{flex:1}}>
                  <div style={{fontSize:"15px",fontWeight:"600",color:"#1a1a1a",textDecoration:p.status==="kupione"?"line-through":"none",marginBottom:"6px"}}>{p.nazwa}</div>
                  <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                    <button onClick={() => zmienIlosc(p,-1)} style={{width:"28px",height:"28px",background:"#f5f5f5",border:"none",borderRadius:"8px",fontSize:"16px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>−</button>
                    <span style={{fontSize:"13px",fontWeight:"700",color:"#333",minWidth:"48px",textAlign:"center"}}>{p.ilosc} {p.jednostka}</span>
                    <button onClick={() => zmienIlosc(p,1)} style={{width:"28px",height:"28px",background:"#f5f5f5",border:"none",borderRadius:"8px",fontSize:"16px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555"}}>+</button>
                  </div>
                </div>
                {p.cena > 0 && <div style={{fontSize:"12px",color:"#aaa",fontWeight:"600",flexShrink:0}}>{(p.cena*p.ilosc).toFixed(2)} zł</div>}
              </div>
            ))}
          </div>
        ))}
        {produkty.length === 0 && (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <div style={{fontSize:"60px",marginBottom:"16px"}}>📝</div>
            <p style={{color:"#aaa",fontSize:"17px",fontWeight:"600"}}>Lista jest pusta</p>
            <p style={{color:"#ccc",fontSize:"14px",marginTop:"4px"}}>Dodaj pierwszy produkt</p>
          </div>
        )}
      </div>

      {pokazForm && (
        <div onClick={() => setPokazForm(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",zIndex:50}}>
          <div onClick={e => e.stopPropagation()} style={{background:"white",width:"100%",maxWidth:"500px",margin:"0 auto",borderRadius:"28px 28px 0 0",padding:"24px"}}>
            <div style={{width:"40px",height:"4px",background:"#e0e0e0",borderRadius:"4px",margin:"0 auto 20px"}}></div>
            <h2 style={{fontSize:"20px",fontWeight:"800",color:"#1a1a1a",marginBottom:"16px"}}>Dodaj produkt</h2>
            <input value={nowyProdukt} onChange={e => setNowyProdukt(e.target.value)} placeholder="Nazwa produktu *" autoFocus
              style={{width:"100%",border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"16px",outline:"none",marginBottom:"10px",boxSizing:"border-box"}} />
            <select value={kategoria} onChange={e => setKategoria(e.target.value)}
              style={{width:"100%",border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"15px",outline:"none",marginBottom:"10px",boxSizing:"border-box",background:"white",color:"#333"}}>
              {KATEGORIE.map(k => <option key={k}>{k}</option>)}
            </select>
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              <div style={{display:"flex",alignItems:"center",background:"#f5f5f5",borderRadius:"14px",flex:1}}>
                <button onClick={() => setIlosc(Math.max(1,ilosc-1))} style={{width:"44px",height:"48px",border:"none",background:"transparent",fontSize:"20px",fontWeight:"700",cursor:"pointer",color:"#555"}}>−</button>
                <span style={{flex:1,textAlign:"center",fontWeight:"700",fontSize:"16px"}}>{ilosc}</span>
                <button onClick={() => setIlosc(ilosc+1)} style={{width:"44px",height:"48px",border:"none",background:"transparent",fontSize:"20px",fontWeight:"700",cursor:"pointer",color:"#555"}}>+</button>
              </div>
              <select value={jednostka} onChange={e => setJednostka(e.target.value)}
                style={{border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"0 12px",fontSize:"15px",outline:"none",background:"white",color:"#333"}}>
                {JEDNOSTKI.map(j => <option key={j}>{j}</option>)}
              </select>
              <input type="number" value={cena} onChange={e => setCena(e.target.value)} placeholder="Cena"
                style={{width:"80px",border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"0 12px",fontSize:"15px",outline:"none",textAlign:"center"}} />
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => setPokazForm(false)} style={{flex:1,padding:"16px",borderRadius:"14px",border:"1.5px solid #e0e0e0",background:"white",fontSize:"15px",fontWeight:"700",color:"#555",cursor:"pointer"}}>Anuluj</button>
              <button onClick={dodajProdukt} style={{flex:1,padding:"16px",borderRadius:"14px",border:"none",background:"#1a1a1a",color:"white",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}>Dodaj</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setPokazForm(true)} style={{position:"fixed",bottom:"24px",right:"24px",width:"60px",height:"60px",background:"#1a1a1a",color:"white",border:"none",borderRadius:"20px",fontSize:"28px",cursor:"pointer",boxShadow:"0 8px 24px rgba(0,0,0,0.25)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:40}}>+</button>
    </main>
  );
}
