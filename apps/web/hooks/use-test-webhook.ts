import { useCallback, useMemo, useState, useTransition } from "react";
import { env } from "@workspace/env";
import { testWebhook } from "@/actions/test-webhook/action";
import { actionTemplate } from "@workspace/whatsapp/action-template";
import { removeTrailingSlash } from "@workspace/utils/url";

const validateWebhookURL = (url: string) => {
  const baseURL = removeTrailingSlash(env.NEXT_PUBLIC_MONIKA_NOTIFY_API_URL);
  if (!url.startsWith(`${baseURL}/api/notify?token=`)) {
    return `Please provide a valid Webhook URL: ${baseURL}/api/notify?token=YOUR_TOKEN`;
  }
  return null;
};

export const useTestWebhook = () => {
  // TEST#1
  const [url, setUrl] = useState("");
  // TEST#2
  const [type, setType] = useState<keyof typeof actionTemplate>("start");
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const submitTestWebhook = useCallback(async () => {
    const error = validateWebhookURL(url);
    // TEST#3
    if (error) {
      setErrorMessage(error);
      return;
    }

    const webhookURL = new URL(url);
    const search = new URLSearchParams(webhookURL.search);
    const token = search.get("token");
    if (!token) {
      // TEST#4
      setErrorMessage("Token is required");
      return;
    }

    // TEST#5
    startTransition(async () => {
      // TEST#5
      const data = await testWebhook({ type, token });
      if (data?.error) {
        // TEST#5
        setErrorMessage(data.error);
      }
    });
  }, [url, type]);

  return useMemo(() => {
    return {
      url,
      setUrl,
      type,
      setType,
      errorMessage,
      submitTestWebhook,
      pending,
    };
  }, [url, setUrl, type, setType, errorMessage, submitTestWebhook, pending]);
};
