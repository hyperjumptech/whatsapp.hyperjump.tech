import { getWebhookByToken } from "@/lib/repositories/webhook-token";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { notFound } from "next/navigation";
import DeleteButton from "./delete-button";

export async function DeletePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenExists = await getWebhookByToken(token);

  // TEST#2
  if (!tokenExists) {
    notFound();
  }

  return <BaseDeletePage token={token} />;
}

export const BaseDeletePage = ({ token }: { token: string }) => {
  return (
    <div className="w-full md:w-8/12 lg:w-6/12 space-y-4 pt-10">
      <FontAwesomeIcon
        data-testid="icon"
        className="text-2xl md:text-3xl lg:text-5xl"
        icon={faExclamationTriangle}
      />
      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold">
        Delete Account
      </h1>
      <p>
        Are you sure you want to delete your account? Your webhook URL will be
        deactivated and you won’t receive Whatsapp message from Monika anymore.
      </p>
      <DeleteButton token={token} />
    </div>
  );
};
