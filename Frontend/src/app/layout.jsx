export const dynamic = 'force-dynamic';
import { ClerkProvider } from '@clerk/nextjs'
import AppProvider from '@/components/providers/AppProvider';
import { JetBrains_Mono, Oswald, Playfair_Display } from 'next/font/google';
import './globals.css'


const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata = {
  title: 'DevSpace Club',
  description: 'DevSpace Coding Club Portal',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${jetbrains.variable} ${oswald.variable} ${playfair.variable}`}>
          <AppProvider>
            {children}
          </AppProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
