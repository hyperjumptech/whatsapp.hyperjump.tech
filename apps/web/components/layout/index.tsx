/* eslint-disable @next/next/no-img-element */
import Header from "@/components/header";
import Footer from "@/components/footer";

type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <>
      <Header />
      <Content>{children}</Content>
      <Footer />
    </>
  );
}

function Content({ children }: LayoutProps): React.JSX.Element {
  return (
    <main className="flex flex-col w-full py-5 text-white bg-monika-black">
      <div className="z-10 w-full px-8 py-4 sm:px-6 lg:px-16 md:p-8 lg:p-16">
        {children}
      </div>
      <div className="z-0 mt-0 lg:-mt-48">
        <img
          src="/assets/wave-monika.svg"
          className="object-fill w-screen"
          alt="Monika Wave"
        />
        <div
          style={{ height: "2px", marginTop: "2px" }}
          className="bg-gradient-to-r from-monika-purple to-monika-aqua"
        />
      </div>
    </main>
  );
}
