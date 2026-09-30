import type { Metadata } from 'next'
import { Pacifico } from 'next/font/google'
import "./globals.css"

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
})

export const metadata: Metadata = {
  title: 'Biswadeep Tewari | Links',
  description: 'Full-Stack & AI/ML Engineer. Connect with me here.',
  openGraph: {
    title: 'Biswadeep Tewari | Links',
    description: 'Full-Stack & AI/ML Engineer',
    images: [{ url: 'https://github.com/RajTewari01.png' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={pacifico.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
