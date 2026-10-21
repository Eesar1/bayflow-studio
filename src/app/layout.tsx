import type { Metadata } from "next";
import { Archivo, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
  display: "swap",
});
export const metadata: Metadata = {
  title: { default: "BayFlow · Every repair, in flow.", template: "%s · BayFlow" },
  description:
    "Book workshop services, approve itemized estimates and follow every repair through its final quality check.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${dm.variable} ${mono.variable}`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
