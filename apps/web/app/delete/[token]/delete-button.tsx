"use client";

import { deleteToken } from "@/actions/delete-token/action";
import Button from "@/components/button";
import { useTransition } from "react";

export default function DeleteButton({ token }: { token: string }) {
  const [isDeleting, startTransition] = useTransition();
  // TEST#1
  return (
    <Button
      disabled={isDeleting}
      // TEST#2
      onClick={() =>
        startTransition(async () => {
          await deleteToken({ token });
        })
      }>
      {/* TEST#3 */}
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
