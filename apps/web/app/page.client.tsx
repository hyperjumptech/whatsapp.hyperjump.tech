"use client";

import { useRegisterResend } from "@/hooks/use-register-resend";
import CountryPhoneInput from "@/components/country-phone-input";
import TextInput from "@/components/text-input";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/components/button";

const countryCodePhoneErrorMessage =
  "Phone must starts with valid country code";

// TEST#1
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

  return (
    <div className="w-full space-y-8">
      {/* TEST#2*/}
      {tab === "register" && (
        <TextInput
          data-testid="name-input"
          label="Please enter your name"
          value={data.name}
          onChange={(e) => {
            setErrorForKey("name", "");
            setDataForKey("name", e.target.value);
          }}
          // TEST#2.1
          errorMessage={errors.name}
        />
      )}
      {/* TEST#3 */}
      <CountryPhoneInput
        label="Please enter your WhatsApp phone number. We will send a message to confirm your number."
        value={data.phone}
        // TEST#3.3
        handleChangeValue={(value) => {
          setErrorForKey("phone", "");
          setDataForKey("phone", value);
        }}
        // TEST#3.1
        errorMessage={errors.phone}
        // TEST#3.2
        handleNotValid={() =>
          setErrorForKey("phone", countryCodePhoneErrorMessage)
        }
      />
      {/* TEST#4 */}
      {!!errors.register && (
        <div className="flex">
          <FontAwesomeIcon className="m-1 ml-0" icon={faTimesCircle} />
          <p className="font-bold">{errors.register}</p>
        </div>
      )}
      {/* TEST#5 */}
      {tab === "register" && (
        <Button
          data-testid="submit-button"
          disabled={isPendingRegister}
          // TEST#5.1
          onClick={() => handleRegister()}>
          {/* TEST#5.2 */}
          {isPendingRegister ? "Loading..." : "Next"}
        </Button>
      )}
      {/* TEST#6 */}
      {tab === "resend" && (
        <Button
          data-testid="resend-button"
          disabled={isPendingResend}
          // TEST#6.1
          onClick={() => handleResend()}>
          {/* TEST#6.2 */}
          {isPendingResend ? "Loading..." : "Resend Instruction"}
        </Button>
      )}
    </div>
  );
}
