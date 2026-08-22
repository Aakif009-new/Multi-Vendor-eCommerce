import React from 'react';

export const metadata = {
  title: 'Multi-Vendor Marketplace',
  description: 'Empowering local businesses through digital commerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
