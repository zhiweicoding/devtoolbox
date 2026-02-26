import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "DevToolBox - Free Online Developer Tools",
  description:
    "Free online developer tools: XML formatter, JWT decoder, LinkedIn text formatter, YAML validator, CSV viewer and more. No signup required — everything runs in your browser.",
  keywords:
    "developer tools, online tools, XML formatter, JWT decoder, LinkedIn formatter, YAML validator, CSV viewer, free tools",
  openGraph: {
    title: "DevToolBox - Free Online Developer Tools",
    description:
      "Format, validate, decode and generate — all in your browser. Fast, free, private.",
    type: "website",
    url: "https://devtoolbox.co",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
