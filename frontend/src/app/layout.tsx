import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { ReactNode } from "react";

export const metadata = {
  title: "Marketplace Analytics",
  description: "Listings search + analytics"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
