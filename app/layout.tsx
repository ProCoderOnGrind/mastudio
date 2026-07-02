import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { ViewerProvider } from "@/components/viewer/ViewerContext";
import ProjectViewer from "@/components/viewer/ProjectViewer";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MA STUDIO & PARTNERS",
  description:
    "Modelling Architecture Studio & Partners — architecture, urban planning, landscape and interior design based in Tirana, Albania.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={beVietnam.className}>
      <body className="bg-white text-black antialiased">
        <ViewerProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <ProjectViewer />
        </ViewerProvider>
      </body>
    </html>
  );
}
