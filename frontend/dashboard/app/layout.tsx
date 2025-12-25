import "./globals.css";

export const metadata = {
  title: "Google Reviews Widget Dashboard",
  description: "Manage AI-powered Google Reviews sync and widget configuration."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

