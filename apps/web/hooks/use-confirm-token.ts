"use client";

import { notFound, useParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { confirmToken as confirmTokenAction } from "@/actions/confirm-token/action";

export const useConfirmToken = () => {
  const params = useParams();

  // TEST#1
  const token = params?.token as string | undefined;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // TEST#2
  if (!token) {
    notFound();
  }

  const confirmToken = useCallback(async () => {
    // TEST#3
    startTransition(async () => {
      const response = await confirmTokenAction({ token });
      // TEST#4
      if (response.error) {
        setError(response.error);
      }
    });
  }, [token]);

  return {
    token,
    confirmToken,
    // TEST#5
    pending,
    error,
  };
};
