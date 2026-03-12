"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, arrayUnion } from "firebase/firestore";

interface Zaproszenie {
  id: string;
  listaId: string;
  listaNazwa: string;
  wlascicielEmail: string;
  wlascicielNazwa: string;
  status: string;
}

export default function Zaproszenia() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [zaproszenia, setZaproszenia] = useState<Zaproszenie[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) { router.push("/"); return; }
      setUser(u);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "zaproszenia"), where("email", "==", user.email), where("status", "==", "oczekuje"));
    const unsub = onSnapshot(q, (snap) => {
      setZaproszenia(snap.docs.map(d => ({ id: d.id, ...d.data() } as Zaproszenie)));
    });
    return unsub;
  }, [user]);

  const akceptuj = async (z: Zaproszenie) => {
    await updateDoc(doc(db, "zaproszenia", z.id), { status: "zaakceptowane" });
    await updateDoc(doc(db, "listy", z.listaId), { uzytkownicy: arrayUnion(user.email) });
    router.push(`/listy/${z.listaId}`);
  };

  const odrzuc = async (z: Zaproszenie) => {
    await updateDoc(doc(db, "zaproszenia", z.id), { status: "odrzucone" });
  };

  return (
    <main style={{minHeight:"100vh",background:"#f7f7f7",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",paddingBottom:"40px"}}>
      <div style={{background:"white",padding:"48px 20px 16px",borderBottom:"1px solid #f0f0f0"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",maxWidth:"500px",margin:"0 auto"}}>
          <button onClick={() => router.push("/listy")} style={{width:"36px",height:"36px",background:"#f5f5f5",border:"none",borderRadius:"12px",fontSize:"20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <h1 style={{fontSize:"20px",fontWeight:"800",color:"#1a1a1a",flex:1,letterSpacing:"-0.5px"}}>Zaproszenia</h1>
        </div>
      </div>

      <div style={{maxWidth:"500px",margin:"0 auto",padding:"20px 16px"}}>
        {zaproszenia.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <div style={{fontSize:"60px",marginBottom:"16px"}}>📬</div>
            <p style={{color:"#aaa",fontSize:"17px",fontWeight:"600"}}>Brak zaproszeń</p>
            <p style={{color:"#ccc",fontSize:"14px",marginTop:"4px"}}>Gdy ktoś zaprosi Cię do listy, zobaczysz to tutaj</p>
          </div>
        ) : zaproszenia.map(z => (
          <div key={z.id} style={{background:"white",borderRadius:"20px",padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",marginBottom:"12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
              <div style={{width:"48px",height:"48px",background:"#e8f5e9",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px"}}>🛒</div>
              <div>
                <div style={{fontSize:"17px",fontWeight:"800",color:"#1a1a1a"}}>{z.listaNazwa}</div>
                <div style={{fontSize:"13px",color:"#aaa",marginTop:"2px"}}>od {z.wlascicielNazwa}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => odrzuc(z)} style={{flex:1,padding:"14px",borderRadius:"14px",border:"1.5px solid #e0e0e0",background:"white",fontSize:"15px",fontWeight:"700",color:"#555",cursor:"pointer"}}>Odrzuć</button>
              <button onClick={() => akceptuj(z)} style={{flex:1,padding:"14px",borderRadius:"14px",border:"none",background:"#2e7d32",color:"white",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}>Akceptuj</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
