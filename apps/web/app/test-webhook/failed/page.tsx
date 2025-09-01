import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/button";
import Link from "next/link";

export default function TestWebhookFailed() {
  return (
    <div className="w-full md:w-8/12 lg:w-6/12 space-y-4 py-20">
      <FontAwesomeIcon
        data-testid="icon"
        className="text-2xl md:text-3xl lg:text-5xl"
        icon={faTimesCircle}
      />
      {/* TEST#1 */}
      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold">
        Message cannot be sent!
      </h1>
      {/* TEST#2 */}
      <p>The webhook you provided was invalid.</p>
      {/* TEST#3 */}
      <Link href="/test-webhook">
        <Button>Test again</Button>
      </Link>
    </div>
  );
}
