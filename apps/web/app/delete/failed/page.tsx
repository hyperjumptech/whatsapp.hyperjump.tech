import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/button";
import Link from "next/link";

export default function DeleteFailedPage() {
  // TEST#1
  return (
    <div className="w-full md:w-8/12 lg:w-6/12 space-y-4 py-20">
      <FontAwesomeIcon
        data-testid="icon"
        className="text-2xl md:text-3xl lg:text-5xl"
        icon={faTimesCircle}
      />
      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold">
        Account could not be deleted!
      </h1>
      <p>There is something wrong while deleting your account.</p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
