"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";

interface Zaproszenie {
  id: string;
  email: string;
  status: "oczekuje" | "zaakceptowane" | "odrzucone";
}

export default function Ustawienia() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lista, setLista] = useState<any>(null);
  const [zaproszenia, setZaproszenia] = useState<Zaproszenie[]>([]);
  const [email, setEmail] = useState("");
  const [blad, setBlad] = useState("");
  const [sukces, setSukces] = useState("");

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
    const q = query(collection(db, "zaproszenia"), where("listaId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      setZaproszenia(snap.docs.map(d => ({ id: d.id, ...d.data() } as Zaproszenie)));
    });
    return unsub;
  }, [id]);

  const zapros = async () => {
    setBlad(""); setSukces("");
    if (!email.trim()) return;
    if (!email.includes("@")) { setBlad("Nieprawidłowy email"); return; }
    if (email === user.email) { setBlad("Nie możesz zaprosić siebie"); return; }
    if (lista?.uzytkownicy?.includes(email)) { setBlad("Ta osoba już ma dostęp"); return; }
    const juzZaproszona = zaproszenia.find(z => z.email === email && z.status === "oczekuje");
    if (juzZaproszona) { setBlad("Zaproszenie już zostało wysłane"); return; }
    const zaproszenieId = `${id}_${email.trim().toLowerCase()}`;
    await setDoc(doc(db, "zaproszenia", zaproszenieId), {
      listaId: id,
      listaNazwa: lista?.nazwa,
      wlascicielEmail: user.email,
      wlascicielNazwa: user.displayName || user.email,
      email: email.trim().toLowerCase(),
      status: "oczekuje",
      dataWyslania: new Date(),
    });
    setSukces(`Zaproszenie wysłane do ${email}`);
    setEmail("");
  };

  const usunZaproszenie = async (zId: string) => {
    await deleteDoc(doc(db, "zaproszenia", zId));
  };

  const statusKolor: Record<string, string> = {
    oczekuje: "#f57c00",
    zaakceptowane: "#2e7d32",
    odrzucone: "#e53935",
  };

  const statusLabel: Record<string, string> = {
    oczekuje: "⏳ Oczekuje",
    zaakceptowane: "✅ Zaakceptowane",
    odrzucone: "❌ Odrzucone",
  };

  const jestWlascicielem = lista?.wlasciciel === user?.email;

  return (
    <main style={{minHeight:"100vh",background:"#f7f7f7",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",paddingBottom:"40px"}}>
      <div style={{background:"white",padding:"48px 20px 16px",borderBottom:"1px solid #f0f0f0"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",maxWidth:"500px",margin:"0 auto"}}>
          <button onClick={() => router.push(`/listy/${id}`)} style={{width:"36px",height:"36px",background:"#f5f5f5",border:"none",borderRadius:"12px",fontSize:"20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <h1 style={{fontSize:"20px",fontWeight:"800",color:"#1a1a1a",flex:1,letterSpacing:"-0.5px"}}>Udostępnianie</h1>
        </div>
      </div>

      <div style={{maxWidth:"500px",margin:"0 auto",padding:"20px 16px"}}>
        <div style={{background:"white",borderRadius:"20px",padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",marginBottom:"16px"}}>
          <div style={{fontSize:"13px",fontWeight:"700",color:"#aaa",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"12px"}}>Lista</div>
          <div style={{fontSize:"18px",fontWeight:"800",color:"#1a1a1a",marginBottom:"4px"}}>{lista?.nazwa}</div>
          <div style={{fontSize:"13px",color:"#aaa"}}>Właściciel: {lista?.wlasciciel}</div>
        </div>

        {jestWlascicielem && (
          <div style={{background:"white",borderRadius:"20px",padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",marginBottom:"16px"}}>
            <div style={{fontSize:"13px",fontWeight:"700",color:"#aaa",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"12px"}}>Zaproś osobę</div>
            <div style={{display:"flex",gap:"8px"}}>
              <input value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && zapros()}
                placeholder="Adres email..."
                type="email"
                style={{flex:1,border:"1.5px solid #e0e0e0",borderRadius:"14px",padding:"12px 16px",fontSize:"15px",outline:"none"}} />
              <button onClick={zapros} style={{background:"#1a1a1a",color:"white",border:"none",borderRadius:"14px",padding:"12px 20px",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}>Wyślij</button>
            </div>
            {blad && <div style={{marginTop:"8px",fontSize:"13px",color:"#e53935"}}>{blad}</div>}
            {sukces && <div style={{marginTop:"8px",fontSize:"13px",color:"#2e7d32"}}>{sukces}</div>}
          </div>
        )}

        {zaproszenia.length > 0 && (
          <div style={{background:"white",borderRadius:"20px",padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",marginBottom:"16px"}}>
            <div style={{fontSize:"13px",fontWeight:"700",color:"#aaa",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"12px"}}>Zaproszenia</div>
            {zaproszenia.map(z => (
              <div key={z.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f5f5f5"}}>
                <div>
                  <div style={{fontSize:"15px",fontWeight:"600",color:"#1a1a1a"}}>{z.email}</div>
                  <div style={{fontSize:"12px",color:statusKolor[z.status],fontWeight:"600",marginTop:"2px"}}>{statusLabel[z.status]}</div>
                </div>
                {jestWlascicielem && z.status === "oczekuje" && (
                  <button onClick={() => usunZaproszenie(z.id)} style={{background:"#fff0f0",border:"none",borderRadius:"10px",padding:"6px 12px",fontSize:"12px",fontWeight:"700",color:"#e53935",cursor:"pointer"}}>Cofnij</button>
                )}
              </div>
            ))}
          </div>
        )}

        {lista?.uzytkownicy?.length > 1 && (
          <div style={{background:"white",borderRadius:"20px",padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"13px",fontWeight:"700",color:"#aaa",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"12px"}}>Osoby z dostępem</div>
            {lista.uzytkownicy.map((u: string) => (
              <div key={u} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
                <div style={{width:"36px",height:"36px",background:"#e8f5e9",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:"700",color:"#2e7d32"}}>
                  {u[0].toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"14px",fontWeight:"600",color:"#1a1a1a"}}>{u}</div>
                  {u === lista.wlasciciel && <div style={{fontSize:"11px",color:"#aaa"}}>właściciel</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
