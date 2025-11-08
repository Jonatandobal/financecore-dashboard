import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hemisferia | Panel de Operaciones",
  description: "Dashboard de gestión de operaciones de cambio de divisas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            expand={true}
            richColors
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
