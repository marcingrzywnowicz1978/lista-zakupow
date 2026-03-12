"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { PRODUKTY_BAZA, ProduktBaza } from "@/lib/produktyBaza";

interface ProduktEdytowalny extends ProduktBaza {
  id?: string;
  uid?: string;
  wbudowany?: boolean;
}

const KATEGORIE = ["Pieczywo","Nabiał","Warzywa","Owoce","Mięso","Napoje","Chemia","Kosmetyki","Mrożonki","Sypkie","Inne"];
const KAT_EMOJI: Record<string,string> = {Pieczywo:"🍞",Nabiał:"🥛",Warzywa:"🥦",Owoce:"🍎",Mięso:"🥩",Napoje:"🥤",Chemia:"🧴",Kosmetyki:"💄",Mrożonki:"❄️",Sypkie:"🌾",Inne:"📦"};
const JEDNOSTKI = ["szt.","opak.","kg","g","l","ml"];

export default function Produkty() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wlasneProdukty, setWlasneProdukty] = useState<ProduktEdytowalny[]>([]);
  const [szukaj, setSzukaj] = useState("");
  const [filtrKat, setFiltrKat] = useState("Wszystkie");
  const [edytowany, setEdytowany] = useState<ProduktEdytowalny | null>(null);
  const [pokazForm, setPokazForm] = useState(false);
  const [nowyProdukt, setNowyProdukt] = useState<ProduktBaza>({ nazwa:"", kategoria:"Inne", jednostka:"szt.", cena:0 });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) { router.push("/"); return; }
      setUser(u);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "produktyUzytkownika"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setWlasneProdukty(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProduktEdytowalny)));
    });
    return unsub;
  }, [user]);

  const wszystkie = useMemo(() => {
    const nazwyWlasne = new Set(wlasneProdukty.map(p => p.nazwa.toLowerCase()));
    const wbudowane = PRODUKTY_BAZA
      .filter(p => !nazwyWlasne.has(p.nazwa.toLowerCase()))
      .map(p => ({ ...p, wbudowany: true }));
    return [...wlasneProdukty, ...wbudowane];
  }, [wlasneProdukty]);

  const przefiltrowane = useMemo(() => {
    return wszystkie.filter(p => {
      const pasujeSzukaj = p.nazwa.toLowerCase().includes(szukaj.toLowerCase());
      const pasujeKat = filtrKat === "Wszystkie" || p.kategoria === filtrKat;
      return pasujeSzukaj && pasujeKat;
    });
  }, [wszystkie, szukaj, filtrKat]);

  const zapiszEdycje = async () => {
    if (!edytowany) return;
    if (edytowany.id) {
      await updateDoc(doc(db, "produktyUzytkownika", edytowany.id), {
        nazwa: edytowany.nazwa,
        kategoria: edytowany.kategoria,
        jednostka: edytowany.jednostka,
        cena: edytowany.cena,
      });
    } else {
      await addDoc(collection(db, "produktyUzytkownika"), {
        uid: user.uid,
        nazwa: edytowany.nazwa,
        kategoria: edytowany.kategoria,
        jednostka: edytowany.jednostka,
        cena: edytowany.cena,
      });
    }
    setEdytowany(null);
  };

  const usunProdukt = async (p: ProduktEdytowalny) => {
    if (p.id) {
      await deleteDoc(doc(db, "produktyUzytkownika", p.id));
    }
    setEdytowany(null);
  };

  const dodajNowy = async () => {
    if (!nowyProdukt.nazwa.trim()) return;
    await addDoc(collection(db, "produktyUzytkownika"), {
      uid: user.uid,
      nazwa: nowyProdukt.nazwa.trim(),
      kategoria: nowyProdukt.kategoria,
      jednostka: nowyProdukt.jednostka,
      cena: nowyProdukt.cena || 0,
    });
    setNowyProdukt({ nazwa:"", kategoria:"Inne", jednostka:"szt.", cena:0 });
    setPokazForm(false);
  };

  return (
    <main style={{minHeight:"100vh",background:"#f7f7f7",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",paddingBottom:"100px"}}>
      <div style={{background:"white",padding:"48px 20px 16px",borderBottom:"1px solid #f0f0f0"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",maxWidth:"500px",margin:"0 auto 16px"}}>
          <button onClick={() => router.push("/listy")} style={{width:"36px",height:"36px",background:"#f5f5f5",border:"none",borderRadius:"12px",fontSize:"20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <h1 style={{fontSize:"20px",fontWeight:"800",color:"#1a1a1a",flex:1,letterSpacing:"-0.5px"}}>Baza produktów</h1>
          <span style={{fontSize:"13px",color:"#aaa"}}>{przefiltrowane.length} produktów</span>
        </div>
        <div style={{maxWidth:"500px",margin:"0 auto 10px",background:"#f5f5f5",borderRadius:"14px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"10px"}}>
          <span>🔍</span>
          <input value={szukaj} onChange={e => setSzukaj(e.target.value)} placeholder="Szukaj produktu..."
            style={{flex:1,border:"none",background:"transparent",fontSize:"15px",outline:"none",color:"#333"}} />
        </div>
        <div style={{maxWidth:"500px",margin:"0 auto",display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"4px"}}>
          {["Wszystkie",...KATEGORIE].map(k => (
            <button key={k} onClick={() => setFiltrKat(k)}
              style={{flexShrink:0,padding:"6px 14px",borderRadius:"20px",border:"none",fontSize:"13px",fontWeight:"600",cursor:"pointer",background:filtrKat===k?"#1a1a1a":"#f0f0f0",color:filtrKat===k?"white":"#555"}}>
              {k === "Wszystkie" ? "Wszystkie" : `${KAT_EMOJI[k]} ${k}`}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:"500px",margin:"0 auto",padding:"16px"}}>
        {przefiltrowane.map((p, i) => (
          <div key={p.id || i} onClick={() => setEdytowany({...p})}
            style={{background:"white",borderRadius:"16px",padding:"14px 16px",display:"flex",alignItems:"center",gap:"12px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",marginBottom:"8px",cursor:"pointer"}}>
            <div style={{width:"42px",height:"42px",background:"#f5f5f5",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>
              {KAT_EMOJI[p.kategoria] || "📦"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:"15px",fontWeight:"600",color:"#1a1a1a"}}>{p.nazwa}</div>
              <div style={{fontSize:"12px",color:"#aaa",marginTop:"2px"}}>{p.kategoria} · {p.jednostka}</div>
            </div>
            <div style={{textAlign:"right"}}>
              {p.cena > 0 && <div style={{fontSize:"14px",fontWeight:"700",color:"#2e7d32"}}>{p.cena.toFixed(2)} zł</div>}
              {p.wbudowany && <div style={{fontSize:"10px",color:"#ccc",marginTop:"2px"}}>wbudowany</div>}
              {!p.wbudowany && <div style={{fontSize:"10px",color:"#4caf50",marginTop:"2px"}}>własny</div>}
            </div>
          </div>
        ))}
      </div>

      {edytowany && (
        <div onClick={() => setEdytowany(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",zIndex:50}}>
          <div onClick={e => e.stopPropagation()} style={{background:"white",width:"100%",maxWidth:"500px",margin:"0 auto",borderRadius:"28px 28px 0 0",padding:"24px"}}>
            <div style={{width:"40px",height:"4px",background:"#e0e0e0",borderRadius:"4px",margin:"0 auto 20px"}}></div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <h2 style={{fontSize:"20px",fontWeight:"800",color:"#1a1a1a"}}>Edytuj produkt</h2>
              {!edytowany.wbudowany && edytowany.id && (
                <button onClick={() => usunProdukt(edytowany)} style={{background:"#fff0f0",border:"none",borderRadius:"10px",padding:"8px 14px",fontSize:"13px",fontWeight:"700",color:"#e53935",cursor:"pointer"}}>Usuń</button>
              )}
            </div>
            {edytowany.wbudowany && (
              <div style={{background:"#fff8e1",borderRadius:"12px",padding:"10px 14px",marginBottom:"14px",fontSize:"13px",color:"#f57c00"}}>
                ⚠️ To produkt wbudowany. Edycja zapisze Twoją własną wersję.
              </div>
            )}
            <input value={edytowany.nazwa} onChange={e => setEdytowany({...edytowany, nazwa:e.target.value})} placeholder="Nazwa"
              style={{width:"100%",border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"16px",outline:"none",marginBottom:"10px",boxSizing:"border-box"}} />
            <select value={edytowany.kategoria} onChange={e => setEdytowany({...edytowany, kategoria:e.target.value})}
              style={{width:"100%",border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"15px",outline:"none",marginBottom:"10px",boxSizing:"border-box",background:"white",color:"#333"}}>
              {KATEGORIE.map(k => <option key={k}>{k}</option>)}
            </select>
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              <select value={edytowany.jednostka} onChange={e => setEdytowany({...edytowany, jednostka:e.target.value})}
                style={{flex:1,border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"15px",outline:"none",background:"white",color:"#333"}}>
                {JEDNOSTKI.map(j => <option key={j}>{j}</option>)}
              </select>
              <input type="number" value={edytowany.cena} onChange={e => setEdytowany({...edytowany, cena:parseFloat(e.target.value)||0})} placeholder="Cena zł"
                style={{flex:1,border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"15px",outline:"none",textAlign:"center"}} />
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => setEdytowany(null)} style={{flex:1,padding:"16px",borderRadius:"14px",border:"1.5px solid #e0e0e0",background:"white",fontSize:"15px",fontWeight:"700",color:"#555",cursor:"pointer"}}>Anuluj</button>
              <button onClick={zapiszEdycje} style={{flex:1,padding:"16px",borderRadius:"14px",border:"none",background:"#1a1a1a",color:"white",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}>Zapisz</button>
            </div>
          </div>
        </div>
      )}

      {pokazForm && (
        <div onClick={() => setPokazForm(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",zIndex:50}}>
          <div onClick={e => e.stopPropagation()} style={{background:"white",width:"100%",maxWidth:"500px",margin:"0 auto",borderRadius:"28px 28px 0 0",padding:"24px"}}>
            <div style={{width:"40px",height:"4px",background:"#e0e0e0",borderRadius:"4px",margin:"0 auto 20px"}}></div>
            <h2 style={{fontSize:"20px",fontWeight:"800",color:"#1a1a1a",marginBottom:"16px"}}>Nowy produkt</h2>
            <input value={nowyProdukt.nazwa} onChange={e => setNowyProdukt({...nowyProdukt, nazwa:e.target.value})} placeholder="Nazwa produktu *" autoFocus
              style={{width:"100%",border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"16px",outline:"none",marginBottom:"10px",boxSizing:"border-box"}} />
            <select value={nowyProdukt.kategoria} onChange={e => setNowyProdukt({...nowyProdukt, kategoria:e.target.value})}
              style={{width:"100%",border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"15px",outline:"none",marginBottom:"10px",boxSizing:"border-box",background:"white",color:"#333"}}>
              {KATEGORIE.map(k => <option key={k}>{k}</option>)}
            </select>
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              <select value={nowyProdukt.jednostka} onChange={e => setNowyProdukt({...nowyProdukt, jednostka:e.target.value})}
                style={{flex:1,border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"15px",outline:"none",background:"white",color:"#333"}}>
                {JEDNOSTKI.map(j => <option key={j}>{j}</option>)}
              </select>
              <input type="number" value={nowyProdukt.cena || ""} onChange={e => setNowyProdukt({...nowyProdukt, cena:parseFloat(e.target.value)||0})} placeholder="Cena zł"
                style={{flex:1,border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"14px 16px",fontSize:"15px",outline:"none",textAlign:"center"}} />
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => setPokazForm(false)} style={{flex:1,padding:"16px",borderRadius:"14px",border:"1.5px solid #e0e0e0",background:"white",fontSize:"15px",fontWeight:"700",color:"#555",cursor:"pointer"}}>Anuluj</button>
              <button onClick={dodajNowy} style={{flex:1,padding:"16px",borderRadius:"14px",border:"none",background:"#1a1a1a",color:"white",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}>Dodaj</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setPokazForm(true)} style={{position:"fixed",bottom:"24px",right:"24px",width:"60px",height:"60px",background:"#1a1a1a",color:"white",border:"none",borderRadius:"20px",fontSize:"28px",cursor:"pointer",boxShadow:"0 8px 24px rgba(0,0,0,0.25)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:40}}>+</button>
    </main>
  );
}
