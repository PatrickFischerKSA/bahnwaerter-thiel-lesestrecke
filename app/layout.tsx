import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const description = "Eine literarische Lesestrecke zu Gerhart Hauptmanns Bahnwärter Thiel";
  return {
    metadataBase: new URL(origin), title: "Bahnwärter Thiel · Lesestrecke", description,
    openGraph: { title: "Bahnwärter Thiel · Lesestrecke", description, images: [{ url: `${origin}/og.png`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: "Bahnwärter Thiel · Lesestrecke", description, images: [`${origin}/og.png`] }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
