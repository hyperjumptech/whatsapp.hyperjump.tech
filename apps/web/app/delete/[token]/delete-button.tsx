"use client";

import { deleteToken } from "@/actions/delete-token/action";
import Button from "@/components/button";
import { useTransition } from "react";

interface DeleteButtonProps {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function BaseDeleteButton({
  disabled,
  onClick,
  children,
}: DeleteButtonProps) {
  return (
    <Button disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

export default function DeleteButton({ token }: { token: string }) {
  const [isDeleting, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await deleteToken({ token });
    });
  };

  return (
    <BaseDeleteButton disabled={isDeleting} onClick={handleClick}>
      {isDeleting ? "Deleting..." : "Delete"}
    </BaseDeleteButton>
  );
}
