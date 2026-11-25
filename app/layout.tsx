import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bahnwärter Thiel · Lesestrecke",
  description: "Originaltext und DEFA-Film in acht Abschnitten, Detailfragen mit Feedback und sieben Deutungsstationen.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
