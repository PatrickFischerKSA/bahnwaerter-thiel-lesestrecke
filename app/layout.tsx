import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bahnwärter Thiel · Lesestrecke",
  description: "Eine literarische Lesestrecke zu Gerhart Hauptmanns Bahnwärter Thiel",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
