import Notes from "@/components/notes";
import TestWebhookPage from "./page.client";

export default function IndexPage() {
  return (
    <div className="flex flex-col space-y-8 lg:space-y-16 w-full max-w-lg">
      <div className="space-y-2">
        <h1 className="text-xl mt-6 md:text-2xl lg:text-4xl font-bold">
          Test your Webhook
        </h1>
        <p>
          After successful registration, you will receive a unique webhook link.
          You can test your webhook to receive notifications to your Whatsapp
          here.
        </p>
      </div>
      {/* TEST#1 */}
      <TestWebhookPage />
      <Notes />
    </div>
  );
}
