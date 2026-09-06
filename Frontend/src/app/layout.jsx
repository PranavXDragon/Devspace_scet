export const dynamic = 'force-dynamic';
import { ClerkProvider } from '@clerk/nextjs'
import AppProvider from '@/components/providers/AppProvider';
import './globals.css'

export const metadata = {
  title: 'DevSpace Club',
  description: 'DevSpace Coding Club Portal',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <AppProvider>
            {children}
          </AppProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
