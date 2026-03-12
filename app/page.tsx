"use client";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.push("/listy");
    });
    return unsubscribe;
  }, [router]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main style={{minHeight:"100vh",background:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px"}}>
      <div style={{width:"100%",maxWidth:"360px"}}>
        <div style={{width:"80px",height:"80px",background:"#e8f5e9",borderRadius:"24px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"40px",marginBottom:"24px",marginLeft:"auto",marginRight:"auto"}}>🛒</div>
        <h1 style={{fontSize:"28px",fontWeight:"800",color:"#1a1a1a",marginBottom:"6px",textAlign:"center",letterSpacing:"-0.5px"}}>Lista Zakupów</h1>
        <p style={{fontSize:"15px",color:"#888",marginBottom:"48px",textAlign:"center"}}>Wspólne zakupy bez chaosu</p>
        <button onClick={handleLogin} style={{width:"100%",background:"#1a1a1a",color:"white",border:"none",borderRadius:"16px",padding:"18px",fontSize:"16px",fontWeight:"700",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",cursor:"pointer"}}>
          <div style={{width:"20px",height:"20px",background:"white",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"900",color:"#4285f4"}}>G</div>
          Zaloguj się przez Google
        </button>
        <p style={{marginTop:"16px",fontSize:"12px",color:"#bbb",textAlign:"center"}}>Twoje dane są bezpieczne</p>
        <div style={{marginTop:"40px",display:"flex",alignItems:"center",gap:"8px",background:"#f8f8f8",borderRadius:"12px",padding:"12px 16px"}}>
          <span>👨‍👩‍👧‍👦</span>
          <span style={{fontSize:"13px",color:"#555"}}>Udostępniaj listy rodzinie i znajomym</span>
        </div>
      </div>
    </main>
  );
}
