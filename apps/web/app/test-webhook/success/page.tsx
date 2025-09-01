import Button from "@/components/button";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function TestWebhookSuccess() {
  return (
    <div className="w-full md:w-8/12 lg:w-6/12 space-y-4 pt-10">
      {/* TEST#1 */}
      <FontAwesomeIcon
        data-testid="icon"
        className="text-2xl md:text-3xl lg:text-5xl"
        icon={faCheckCircle}
      />
      {/* TEST#2 */}
      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold">
        Message sent!
      </h1>
      {/* TEST#3 */}
      <p>You should receive a message in your Whatsapp shortly.</p>
      {/* TEST#4 */}
      <Link href="/test-webhook">
        <Button>Test again</Button>
      </Link>
    </div>
  );
}
