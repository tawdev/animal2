import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import PublicShell from "@/app/components/PublicShell";
import { CartProvider } from "@/app/context/CartContext";
import { WishlistProvider } from "@/app/context/WishlistContext";
import { CompareProvider } from "@/app/context/CompareContext";
import { SettingsProvider } from "@/app/context/SettingsContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://animalfoodexpress.ma'),
  title: {
    default: 'Animal Food Express – Votre Animalerie Premium au Maroc',
    template: '%s | Animal Food Express'
  },
  description: 'Découvrez Animal Food Express, la boutique en ligne n°1 au Maroc pour l\'alimentation et les accessoires premium pour chiens, chats, oiseaux et poissons. Livraison rapide partout au Maroc.',
  keywords: ['animalerie maroc', 'nourriture chien maroc', 'nourriture chat maroc', 'accessoires animaux maroc', 'animal food express', 'pet market maroc'],
  authors: [{ name: 'Animal Food Express' }],
  creator: 'Animal Food Express',
  publisher: 'Animal Food Express',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Animal Food Express – Votre Animalerie Premium au Maroc',
    description: 'Boutique en ligne spécialisée en alimentation et accessoires pour animaux au Maroc.',
    url: 'https://animalfoodexpress.ma',
    siteName: 'Animal Food Express',
    locale: 'fr_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animal Food Express Maroc',
    description: 'Alimentation et accessoires premium pour vos animaux.',
  },
  robots: {
    index: true,
    follow: true,
  }
};

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationOverlay from "./components/NotificationOverlay";
import ScrollToTop from "./components/ScrollToTop";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <NotificationProvider>
            <SettingsProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <CartProvider>
                      <PublicShell>
                        {children}
                      </PublicShell>
                      <NotificationOverlay />
                      <ScrollToTop />
                    </CartProvider>
                  </CompareProvider>
                </WishlistProvider>
              </AuthProvider>
            </SettingsProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


