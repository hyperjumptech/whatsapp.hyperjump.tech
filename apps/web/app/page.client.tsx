"use client";

import { useRegisterResend } from "@/hooks/use-register-resend";
import CountryPhoneInput from "@/components/country-phone-input";
import TextInput from "@/components/text-input";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/button";
import { useCallback } from "react";

const countryCodePhoneErrorMessage =
  "Phone must starts with valid country code";

type UseRegisterResend = ReturnType<typeof useRegisterResend>;

interface PageClientFormProps {
  tab: UseRegisterResend["tab"];
  data: UseRegisterResend["data"];
  errors: UseRegisterResend["errors"];
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPhoneNotValid: () => void;
  onRegister: () => void;
  onResend: () => void;
  isPendingRegister: UseRegisterResend["isPendingRegister"];
  isPendingResend: UseRegisterResend["isPendingResend"];
}

/**
 * Pure presentational component of the page client. There is no logic here.
 * @param param0 PageClientFormProps
 * @returns
 */
export const PageClientForm = ({
  tab,
  data,
  errors,
  onNameChange,
  onPhoneChange,
  onPhoneNotValid,
  onRegister,
  onResend,
  isPendingRegister,
  isPendingResend,
}: PageClientFormProps) => {
  return (
    <div className="w-full space-y-8">
      {/* TEST#2*/}
      {tab === "register" && (
        <TextInput
          data-testid="name-input"
          label="Please enter your name"
          value={data.name}
          onChange={(e) => onNameChange(e.target.value)}
          // TEST#2.1
          errorMessage={errors.name}
        />
      )}
      {/* TEST#3 */}
      <CountryPhoneInput
        label="Please enter your WhatsApp phone number. We will send a message to confirm your number."
        value={data.phone}
        // TEST#3.3
        handleChangeValue={onPhoneChange}
        // TEST#3.1
        errorMessage={errors.phone}
        // TEST#3.2
        handleNotValid={onPhoneNotValid}
      />
      {/* TEST#4 */}
      {!!errors.register && (
        <div className="flex">
          <FontAwesomeIcon className="m-1 ml-0" icon={faTimesCircle} />
          <p className="font-bold">{errors.register}</p>
        </div>
      )}
      {/* TEST#4.1 */}
      {!!errors.resend && (
        <div className="flex">
          <FontAwesomeIcon className="m-1 ml-0" icon={faTimesCircle} />
          <p className="font-bold">{errors.resend}</p>
        </div>
      )}
      {/* TEST#5 */}
      {tab === "register" && (
        <Button
          data-testid="submit-button"
          disabled={isPendingRegister}
          // TEST#5.1
          onClick={onRegister}>
          {/* TEST#5.2 */}
          {isPendingRegister ? "Loading..." : "Next"}
        </Button>
      )}
      {/* TEST#6 */}
      {tab === "resend-instruction" && (
        <Button
          data-testid="resend-button"
          disabled={isPendingResend}
          // TEST#6.1
          onClick={onResend}>
          {/* TEST#6.2 */}
          {isPendingResend ? "Loading..." : "Resend Instruction"}
        </Button>
      )}
    </div>
  );
};

/**
 * The main component of the page client. It handles all the logic.
 * @returns
 */
export default function PageClient() {
  const {
    tab,
    data,
    errors,
    setErrorForKey,
    setDataForKey,
    handleRegister,
    handleResend,
    isPendingRegister,
    isPendingResend,
  } = useRegisterResend();

  const handleNameChange = useCallback(
    (value: string) => {
      setErrorForKey("name", "");
      setDataForKey("name", value);
    },
    [setErrorForKey, setDataForKey] as const
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      setErrorForKey("phone", "");
      setDataForKey("phone", value);
    },
    [setErrorForKey, setDataForKey] as const
  );

  const handlePhoneNotValid = useCallback(
    () => {
      setErrorForKey("phone", countryCodePhoneErrorMessage);
    },
    [setErrorForKey] as const
  );

  return (
    <PageClientForm
      tab={tab}
      data={data}
      errors={errors}
      onNameChange={handleNameChange}
      onPhoneChange={handlePhoneChange}
      onPhoneNotValid={handlePhoneNotValid}
      onRegister={handleRegister}
      onResend={handleResend}
      isPendingRegister={isPendingRegister}
      isPendingResend={isPendingResend}
    />
  );
}
