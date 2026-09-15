import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "./providers/auth-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
