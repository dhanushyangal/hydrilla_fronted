import "./globals.css";
import type { ReactNode } from "react";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { ClientProviders } from "../components/ClientProviders";
import { ConditionalNavbar } from "../components/layout/ConditionalNavbar";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "Hydrilla 3D Generator",
  description: "AI 3D generation powered by Tencent Hunyuan 3D Pro",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          footer: "hidden",
          footerPages: "hidden",
        },
      }}
    >
    <html lang="en" className={dmSans.variable}>
        <body className="min-h-screen bg-white">
          <ClientProviders>
            <ConditionalNavbar />
            <main>{children}</main>
          </ClientProviders>
      </body>
    </html>
    </ClerkProvider>
  );
}
