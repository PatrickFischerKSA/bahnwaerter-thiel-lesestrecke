import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bahnwärter Thiel · Ermittlungsakte",
  description:
    "Charité oder Gefängnis? Eine literarische Ermittlung mit Text, Film, historischen Quellen, Spurenregister und begründetem Abschlussbericht.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
