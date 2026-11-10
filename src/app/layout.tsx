import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DF Partners Portal",
    template: "%s | DF Partners Portal",
  },
  description: "Subscribe to DF marketing services or apply to become a DF partner.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              <span className="text-indigo-600">DF</span> Partners Portal
            </Link>
            <nav className="flex gap-4 text-sm font-medium text-slate-600">
              <Link href="/marketing" className="hover:text-indigo-600">
                Marketing
              </Link>
              <Link href="/partners" className="hover:text-indigo-600">
                Partners
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          © Digitalfeet
        </footer>
      </body>
    </html>
  );
}
