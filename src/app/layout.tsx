import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Virtuele Hardloopmaat",
  description: "Een app die audiofeedback geeft op basis van een gesimuleerde afstand",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}