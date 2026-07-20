import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Metiora — AI Operating Workspace',
  description: 'AI Operating Partner for Founders & Startups (OKX.AI ASP)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
