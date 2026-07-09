import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GrowEasy CRM | AI CSV Importer',
  description: 'Intelligently import and map unstructured CSV data into GrowEasy CRM using AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl leading-none">
                    G
                </div>
                <h1 className="text-xl font-semibold text-gray-800">
                    GrowEasy CRM <span className="text-gray-400 font-normal mx-2">/</span> <span className="text-blue-600">AI Importer</span>
                </h1>
            </div>
        </header>
        <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8">
            {children}
        </main>
      </body>
    </html>
  );
}
