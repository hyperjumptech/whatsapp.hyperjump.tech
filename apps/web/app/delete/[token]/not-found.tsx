import Button from "@/components/button";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function NotFound() {
  // TEST#1
  return (
    <div className="w-full md:w-8/12 lg:w-6/12 space-y-4">
      <FontAwesomeIcon
        data-testid="icon"
        className="text-2xl md:text-3xl lg:text-5xl"
        icon={faQuestionCircle}
      />
      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold">
        Account not found
      </h1>
      <p>The account that uses the token provided is not found.</p>
      <Link href="/">
        <Button>Go to Home Page</Button>
      </Link>
    </div>
  );
}
