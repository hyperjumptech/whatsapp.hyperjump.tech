"use client";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/button";
import TextInput from "@/components/text-input";
import Select, { SelectOption } from "@/components/select";
import { useTestWebhook } from "@/hooks/use-test-webhook";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import {
  actionTemplate,
  explanation,
} from "@workspace/whatsapp/action-template";

export default function TestWebhookPage() {
  const {
    url,
    setUrl,
    type,
    setType,
    errorMessage,
    submitTestWebhook,
    // TEST#6
    pending,
  } = useTestWebhook();

  return (
    <div className="w-full space-y-8">
      {/* TEST#1 */}
      <TextInput
        disabled={pending}
        data-testid="webhook-input"
        label="Please enter your unique webhook URL"
        value={url}
        placeholder="https://webhook.site/..."
        // TEST#1.1
        onChange={(e) => setUrl(e.target.value)}
      />
      {/* TEST#2 */}
      <Select
        disabled={pending}
        data-testid="type-select"
        label="Please select which notification you want to receive"
        value={type}
        // TEST#2.1
        onChange={(e) =>
          setType(e.target.value as keyof typeof actionTemplate)
        }>
        <SelectOption value={actionTemplate.start}>Start</SelectOption>
        <SelectOption value={actionTemplate.incident}>Incident</SelectOption>
        <SelectOption value={actionTemplate.recovery}>Recovery</SelectOption>
        <SelectOption value={actionTemplate["status-update"]}>
          Status Update
        </SelectOption>
        <SelectOption value={actionTemplate.terminate}>Terminate</SelectOption>
      </Select>
      {/* TEST#3 */}
      <Alert
        className="bg-monika-gray/10 text-white"
        variant={"default"}
        data-testid="explanation">
        <AlertTitle>{type}</AlertTitle>
        <AlertDescription className="mt-0 text-white">
          {explanation[type]}
        </AlertDescription>
      </Alert>
      {/* TEST#4 */}
      {errorMessage && (
        <div className="flex">
          <FontAwesomeIcon className="m-1 ml-0" icon={faTimesCircle} />
          <p className="font-bold">{errorMessage}</p>
        </div>
      )}
      {/* TEST#5 */}
      <Button
        disabled={pending}
        data-testid="submit-button"
        // TEST#5.1
        onClick={submitTestWebhook}>
        {pending ? "Submitting..." : "Test"}
      </Button>
    </div>
  );
}
