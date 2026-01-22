import type { Metadata } from "next";
import "@crayonai/react-ui/styles/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Co-Pilot",
  description: "AI-native financial co-pilot powered by Thesys SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
