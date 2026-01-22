export const metadata = {
  title: 'Nomad - AI Travel Finance Agent',
  description: 'Plan trip budgets, track expenses, and handle currency conversions with Nomad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}