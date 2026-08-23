import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

const ibmPlexSans = localFont({
  src: [
    { path: './fonts/IBMPlexSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/IBMPlexSans-Medium.ttf', weight: '500', style: 'normal' },
    { path: './fonts/IBMPlexSans-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: './fonts/IBMPlexSans-Bold.ttf', weight: '700', style: 'normal' },
  ],
});

const bebasNeue = localFont({
  src: [
    { path: './fonts/BebasNeue-Regular.ttf', weight: '400', style: 'normal' },
  ],
  variable: "--bebas-neue",
});

export const metadata: Metadata = {
  title: "Bookwise",
  description: "Bookwise is a web application that allows users to borrow books.",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${ibmPlexSans.className} ${bebasNeue.variable} antialiased`} 
        suppressHydrationWarning
      >
        <SessionProvider>
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            expand={true}
            closeButton
          />
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;