import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import Crawler from "./components/Crawler";
import SmoothScroll from "./components/SmoothScroll";
import VineCursor from "./components/VineCursor";
import "./globals.css";

// big text (names, titles, the headline) - smaller text is roc grotesk from typekit
const serif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// the "@" vine trail behind the cursor
const VINES = false;

export const metadata: Metadata = {
  title: "lola sanchez",
  description: "lola sanchez's portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* roc grotesk comes from adobe fonts (typekit), not google */}
        <link rel="stylesheet" href="https://use.typekit.net/hcp6cih.css" />
      </head>
      <body className={serif.variable}>
        {children}
        {VINES && <VineCursor />}
        <Crawler />
        <SmoothScroll />
      </body>
    </html>
  );
}
