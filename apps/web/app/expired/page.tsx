import Button from "@/components/button";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function ExpiredPage() {
  return (
    <div className="w-full md:w-8/12 lg:w-6/12 space-y-4 py-20">
      <FontAwesomeIcon
        data-testid="icon"
        className="text-2xl md:text-3xl lg:text-5xl"
        icon={faTimesCircle}
      />
      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold">
        Link has expired
      </h1>
      <p>
        The confirmation link you clicked has expired. Would you like to get a
        new confirmation link?
      </p>
      <Link href="/">
        <Button>Get a new link</Button>
      </Link>
    </div>
  );
}
