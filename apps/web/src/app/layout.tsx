import React from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'BazaarOne — Multi-Vendor Marketplace for Local Businesses',
  description: 'A modern, production-grade Multi-Vendor E-Commerce platform empowering local artisans and neighborhood shop owners.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-mesh text-surface-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
