import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Preloader } from '@/components/Preloader';
import { ThemeToggle } from '@/components/ThemeToggle';

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${inter.className} bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-50 min-h-screen flex flex-col`}>
        <Preloader />
        <header className="bg-gradient-to-b from-purple-200 to-gray-50 dark:from-slate-900 dark:to-slate-950 px-4 pt-6 pb-12 transition-colors duration-300">
            <div className="max-w-6xl mx-auto flex items-start justify-between gap-3">
                <h1 className="text-3xl font-black text-black dark:text-white tracking-tight uppercase">
                    CSV Importer
                </h1>
                <ThemeToggle />
            </div>
        </header>
        <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8">
            {children}
        </main>
      </body>
    </html>
  );
}
