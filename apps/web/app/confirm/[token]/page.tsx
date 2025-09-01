"use client";
import Button from "@/components/button";
import { useConfirmToken } from "@/hooks/use-confirm-token";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

export default function ConfirmTokenPage() {
  const { confirmToken, pending, error } = useConfirmToken();

  return (
    <div className="w-full md:w-8/12 lg:w-6/12 space-y-4 py-20">
      {/* TEST#1 */}
      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold">
        Confirm registration
      </h1>
      {/* TEST#2 */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* TEST#3 */}
      <Button
        // TEST#4
        onClick={confirmToken}
        // TEST#5
        disabled={pending}>
        Confirm registration
      </Button>
    </div>
  );
}
