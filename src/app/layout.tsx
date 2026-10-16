import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Truly — Conectá donde estás", template: "%s · Truly" },
  description: "Salas sociales temporales para lugares y eventos reales.",
  applicationName: "Truly",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#090a0d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${instrumentSans.variable} ${bricolageGrotesque.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "truly-toast",
              title: "truly-toast-title",
              description: "truly-toast-description",
            },
          }}
        />
      </body>
    </html>
  );
}
