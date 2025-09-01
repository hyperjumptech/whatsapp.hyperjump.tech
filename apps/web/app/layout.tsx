import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import HomeTab, { PlaceholderHomeTab } from "@/components/home-tab";
import Layout from "@/components/layout";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Layout>
            <Suspense fallback={<PlaceholderHomeTab />}>
              <HomeTab />
            </Suspense>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
