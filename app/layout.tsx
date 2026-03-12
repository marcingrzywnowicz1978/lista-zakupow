import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lista Zakupów",
  description: "Wspólne zakupy bez chaosu",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
