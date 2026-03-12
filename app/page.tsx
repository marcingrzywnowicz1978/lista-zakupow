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
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-green-700 mb-2">Lista Zakupów</h1>
        <p className="text-gray-500 mb-8">Wspólne zakupy bez chaosu</p>
        <button
          onClick={handleLogin}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition"
        >
          Zaloguj się przez Google
        </button>
      </div>
    </main>
  );
}
