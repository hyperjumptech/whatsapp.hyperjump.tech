import Notes from "@/components/notes";
import PageClient from "./page.client";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Monika Whatsapp Notifier",
  description:
    "A service to send you Whatsapp messages when your website is down",
  keywords: [
    "whatsapp",
    "notifier",
    "monitoring",
    "devops",
    "synthetic",
    "open source",
    "free tool",
  ],
};

export default function Page() {
  return (
    <div className="flex flex-col space-y-8 lg:space-y-16 w-full max-w-lg">
      <h1 className="text-xl mt-6 md:text-2xl lg:text-4xl font-bold">
        Get WhatsApp message from Monika when your website is down.{" "}
        <i>It’s FREE!</i>
      </h1>
      <Suspense fallback={<div className="h-36" />}>
        <PageClient />
      </Suspense>
      <Notes />
    </div>
  );
}
