import Button from "@/components/button";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function ConfirmedPage() {
  return (
    <div className="w-full md:w-8/12 lg:w-6/12 space-y-4 py-20">
      <FontAwesomeIcon
        data-testid="icon"
        className="text-2xl md:text-3xl lg:text-5xl"
        icon={faCheckCircle}
      />
      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold">
        Phone number confirmed!
      </h1>
      <p>
        We have sent another message to help you set up Whatsapp notification in
        Monika.
      </p>
      <Link href="/">
        <Button variant="outline" className="mr-2">
          Register another phone number
        </Button>
      </Link>
      <Link href="/test-webhook">
        <Button>Test your webhook</Button>
      </Link>
    </div>
  );
}
