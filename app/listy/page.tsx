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
  const [liczbZaproszen, setLiczbZaproszen] = useState(0);
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

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "zaproszenia"), where("email", "==", user.email), where("status", "==", "oczekuje"));
    const unsub = onSnapshot(q, (snap) => {
      setLiczbZaproszen(snap.docs.length);
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

  const ikony = ["🛒","🧴","🎉","🍕","🏠","💊","🐾","👶"];

  return (
    <main style={{minHeight:"100vh",background:"#f7f7f7",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <div style={{background:"white",padding:"52px 20px 16px",borderBottom:"1px solid #f0f0f0"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:"500px",margin:"0 auto 16px"}}>
          <div>
            <p style={{fontSize:"13px",color:"#999"}}>Cześć, {user?.displayName?.split(" ")[0]} 👋</p>
            <h1 style={{fontSize:"24px",fontWeight:"800",color:"#1a1a1a",letterSpacing:"-0.5px"}}>Moje Listy</h1>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <button onClick={() => router.push("/zaproszenia")} style={{position:"relative",background:"#f5f5f5",border:"none",borderRadius:"12px",padding:"8px 14px",fontSize:"13px",fontWeight:"600",color:"#555",cursor:"pointer"}}>
              📬
              {liczbZaproszen > 0 && (
                <span style={{position:"absolute",top:"-4px",right:"-4px",background:"#e53935",color:"white",borderRadius:"50%",width:"18px",height:"18px",fontSize:"11px",fontWeight:"800",display:"flex",alignItems:"center",justifyContent:"center"}}>{liczbZaproszen}</span>
              )}
            </button>
            <button onClick={() => router.push("/produkty")} style={{background:"#f0fdf4",border:"none",borderRadius:"12px",padding:"8px 14px",fontSize:"13px",fontWeight:"600",color:"#2e7d32",cursor:"pointer"}}>📦 Baza</button>
            <button onClick={() => signOut(auth)} style={{background:"#f5f5f5",border:"none",borderRadius:"12px",padding:"8px 14px",fontSize:"13px",fontWeight:"600",color:"#555",cursor:"pointer"}}>Wyloguj</button>
          </div>
        </div>
        <div style={{maxWidth:"500px",margin:"0 auto",background:"#f5f5f5",borderRadius:"14px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{fontSize:"16px"}}>🔍</span>
          <input
            value={nowaLista}
            onChange={e => setNowaLista(e.target.value)}
            onKeyDown={e => e.key === "Enter" && dodajListe()}
            placeholder="Nowa lista lub szukaj..."
            style={{flex:1,border:"none",background:"transparent",fontSize:"15px",outline:"none",color:"#333"}}
          />
          {nowaLista && (
            <button onClick={dodajListe} style={{background:"#1a1a1a",color:"white",border:"none",borderRadius:"10px",padding:"6px 14px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}>Dodaj</button>
          )}
        </div>
      </div>

      <div style={{maxWidth:"500px",margin:"0 auto",padding:"16px"}}>
        {listy.map((lista, i) => (
          <div key={lista.id} style={{background:"white",borderRadius:"20px",padding:"16px",display:"flex",alignItems:"center",gap:"14px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",marginBottom:"10px"}}>
            <div onClick={() => router.push(`/listy/${lista.id}`)} style={{display:"flex",alignItems:"center",gap:"14px",flex:1,cursor:"pointer"}}>
              <div style={{width:"50px",height:"50px",borderRadius:"16px",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",flexShrink:0}}>
                {ikony[i % ikony.length]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:"16px",fontWeight:"700",color:"#1a1a1a"}}>{lista.nazwa}</div>
                <div style={{fontSize:"12px",color:"#aaa",marginTop:"2px"}}>
                  {lista.uzytkownicy.length > 1 ? `👥 ${lista.uzytkownicy.length} osoby` : lista.wlasciciel}
                </div>
              </div>
            </div>
            {lista.wlasciciel === user?.email && (
              <button onClick={() => router.push(`/listy/${lista.id}/ustawienia`)}
                style={{width:"36px",height:"36px",background:"#f5f5f5",border:"none",borderRadius:"12px",fontSize:"18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                👥
              </button>
            )}
          </div>
        ))}
        {listy.length === 0 && (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <div style={{fontSize:"60px",marginBottom:"16px"}}>🛍️</div>
            <p style={{color:"#aaa",fontSize:"17px",fontWeight:"600"}}>Brak list</p>
            <p style={{color:"#ccc",fontSize:"14px",marginTop:"4px"}}>Wpisz nazwę i naciśnij Enter</p>
          </div>
        )}
      </div>
    </main>
  );
}
