import { register } from "@/actions/register/action";
import { resend } from "@/actions/resend/action";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Tab } from "./use-home-tab";

export const validateData = (
  data: { name: string; phone: string },
  tab: Tab
):
  | {
      name: string;
      phone: string;
      register: string;
      resend: string;
    }
  | undefined => {
  const errors = {
    name: "",
    phone: "",
    register: "",
    resend: "",
  };
  if (tab === "register") {
    // TEST#9
    if (data.name.length < 3) {
      errors.name = "Name must be at least 3 characters";
    }
  }
  // TEST#10
  if (data.phone.length < 10) {
    errors.phone = "Phone must be at least 10 characters";
  }

  if (errors.name || errors.phone) {
    return errors;
  }

  // TEST#11
  return undefined;
};

// TEST#3
export const useRegisterResend = () => {
  const [isPendingRegister, startTransitionRegister] = useTransition();
  const [isPendingResend, startTransitionResend] = useTransition();

  const [data, setData] = useState<{
    name: string;
    phone: string;
  }>({
    name: "",
    phone: "",
  });

  const [errors, setErrors] = useState<{
    name: string;
    phone: string;
    register: string;
    resend: string;
  }>({
    name: "",
    phone: "",
    register: "",
    resend: "",
  });

  // TEST#1
  const setDataForKey = useCallback((key: keyof typeof data, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // TEST#4
  const setErrorForKey = useCallback(
    (key: keyof typeof errors, value: string) => {
      setErrors((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // TEST#2
  const clearErrors = useCallback(() => {
    setErrors({
      name: "",
      phone: "",
      register: "",
      resend: "",
    });
  }, []);

  // TEST#8
  const searchParams = useSearchParams();

  // TEST#7
  const tab = (searchParams.get("tab") as Tab) ?? "register";

  // TEST#12
  useEffect(() => {
    // When the tab changes, clear the errors
    clearErrors();
  }, [tab]);

  // TEST#5
  const handleRegister = useCallback(async () => {
    const errors = validateData(data, tab);
    if (errors) {
      setErrors(errors);
      return;
    }

    startTransitionRegister(async () => {
      // TEST#5.1
      const response = await register(data);
      if (response?.error) {
        setErrorForKey("register", response.error);
      }
    });
  }, [data, setErrorForKey, tab]);

  // TEST#6
  const handleResend = useCallback(async () => {
    const errors = validateData(data, tab);
    if (errors) {
      setErrors(errors);
      return;
    }

    startTransitionResend(async () => {
      // TEST#6.1
      const response = await resend(data);
      if (response?.error) {
        setErrorForKey("resend", response.error);
      }
    });
  }, [data, setErrorForKey, tab]);

  return useMemo(
    () => ({
      tab,
      data,
      errors,
      setDataForKey,
      setErrorForKey,
      clearErrors,
      handleRegister,
      handleResend,
      isPendingRegister,
      isPendingResend,
    }),
    [
      tab,
      data,
      errors,
      setDataForKey,
      setErrorForKey,
      clearErrors,
      handleRegister,
      handleResend,
      isPendingRegister,
      isPendingResend,
    ]
  );
};
