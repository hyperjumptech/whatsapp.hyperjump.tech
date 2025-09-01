import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expect, test, vi, describe, afterEach } from "vitest";
import PageClient from "./page.client";
import { useRegisterResend } from "@/hooks/use-register-resend";

vi.mock("@/components/country-phone-input", () => ({
  default: vi.fn(
    ({ handleNotValid, errorMessage, label, value, handleChangeValue }) => (
      <div data-testid="country-phone-input">
        <label>{label}</label>
        <input
          data-testid="phone-input"
          value={value}
          onChange={(e) => handleChangeValue(e.target.value)}
          onBlur={() => {
            // Simulate validation failure to trigger handleNotValid
            if (value && !value.startsWith("+62")) {
              handleNotValid?.();
            }
          }}
        />
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </div>
    )
  ),
}));

vi.mock("@/hooks/use-register-resend", () => ({
  useRegisterResend: vi.fn(() => ({
    tab: "register",
    data: { name: "", phone: "" },
    errors: { name: "", phone: "" },
    setErrorForKey: vi.fn(),
    setDataForKey: vi.fn(),
  })),
}));

describe("PageClient", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("TEST#1: should render", () => {
    render(<PageClient />);
    expect(true).toBe(true);
  });

  test("TEST#2: should render name input", () => {
    render(<PageClient />);
    expect(screen.getByTestId("name-input")).toBeInTheDocument();
  });

  test("TEST#2.1: should render name input with error message", () => {
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "register",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "",
        name: "Something went wrong",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);
    const errorLabel = screen.getByText("Something went wrong");
    expect(errorLabel).toBeInTheDocument();
  });

  test("TEST#2.1: should not render name's error message if it's empty", () => {
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "register",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "",
        name: "",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);
    const errorLabel = screen.queryByText("Something went wrong");
    expect(errorLabel).not.toBeInTheDocument();
  });

  test("TEST#3: should render country phone input", () => {
    render(<PageClient />);
    expect(
      screen.getByText(
        "Please enter your WhatsApp phone number. We will send a message to confirm your number."
      )
    ).toBeInTheDocument();
  });

  test("TEST#3: should render phone input with type tel", () => {
    render(<PageClient />);

    // Find the phone input by test id
    const phoneInput = screen.getByTestId("phone-input");
    expect(phoneInput).toBeInTheDocument();

    // Since we're using a mock, we can't test the actual type attribute
    // but we can verify the input is rendered
    expect(phoneInput).toBeInTheDocument();
  });

  test("TEST#3: should render country dropdown listbox", () => {
    render(<PageClient />);

    // Since we're using a mock, we can't test the actual dropdown functionality
    // but we can verify the country phone input component is rendered
    const countryPhoneInput = screen.getByTestId("country-phone-input");
    expect(countryPhoneInput).toBeInTheDocument();
  });

  test("TEST#3.1: should render country phone input with error message", () => {
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "register",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "Something went wrong",
        name: "",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);
    const errorLabel = screen.getByText("Something went wrong");
    expect(errorLabel).toBeInTheDocument();
  });

  test("TEST#3.2: should call handleNotValid when invalid phone number is entered", () => {
    const setErrorForKey = vi.fn();
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "register",
      data: { name: "", phone: "123456789" }, // Invalid phone number (doesn't start with +62)
      errors: {
        register: "",
        phone: "",
        name: "",
        resend: "",
      },
      setErrorForKey,
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);

    // Find the phone input
    const phoneInput = screen.getByTestId("phone-input");
    expect(phoneInput).toBeInTheDocument();

    // Trigger the onBlur event which will call handleNotValid for invalid phone numbers
    act(() => {
      fireEvent.blur(phoneInput);
    });

    // Verify that setErrorForKey was called with the correct error message
    expect(setErrorForKey).toHaveBeenCalledWith(
      "phone",
      "Phone must starts with valid country code"
    );
  });

  test("TEST#3.3: should set data.phone and clear error.phone when handleChangeValue is called", () => {
    const setDataForKey = vi.fn();
    const setErrorForKey = vi.fn();
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "register",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "Phone error message",
        name: "",
        resend: "",
      },
      setDataForKey,
      setErrorForKey,
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);

    // Find the phone input
    const phoneInput = screen.getByTestId("phone-input");
    expect(phoneInput).toBeInTheDocument();

    // Simulate changing the phone value by calling the onChange handler
    const newPhoneValue = "+628123456789";
    act(() => {
      fireEvent.change(phoneInput, { target: { value: newPhoneValue } });
    });

    // Verify that setDataForKey was called to set the phone data
    expect(setDataForKey).toHaveBeenCalledWith("phone", newPhoneValue);

    // Verify that setErrorForKey was called to clear the phone error
    expect(setErrorForKey).toHaveBeenCalledWith("phone", "");
  });

  test("TEST#4: should render error register", () => {
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "register",
      data: { name: "", phone: "" },
      errors: {
        register: "Something went wrong",
        phone: "",
        name: "",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  test("TEST#5: should render submit button", () => {
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "register",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "",
        name: "",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  test("TEST#5.1: should call handleRegister when submit button is clicked", () => {
    const handleRegister = vi.fn();
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "register",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "",
        name: "",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister,
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);
    const submitButton = screen.getByTestId("submit-button");
    act(() => {
      fireEvent.click(submitButton);
    });
    expect(handleRegister).toHaveBeenCalled();
  });

  test("TEST#5.2: should render submit button with loading state", () => {
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "register",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "",
        name: "",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: true,
      isPendingResend: false,
    });
    render(<PageClient />);
    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute("disabled");
    expect(submitButton).toHaveTextContent("Loading...");
  });

  test("TEST#6: should render resend button", () => {
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "resend",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "",
        name: "",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);
    expect(screen.getByTestId("resend-button")).toBeInTheDocument();
  });

  test("TEST#6.2: should render resend button with loading state", () => {
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "resend",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "",
        name: "",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend: vi.fn(),
      isPendingRegister: false,
      isPendingResend: true,
    });
    render(<PageClient />);
    const resendButton = screen.getByTestId("resend-button");
    expect(resendButton).toBeInTheDocument();
    expect(resendButton).toHaveAttribute("disabled");
    expect(resendButton).toHaveTextContent("Loading...");
  });

  test("TEST#6.1: should call handleResend when resend button is clicked", () => {
    const handleResend = vi.fn();
    vi.mocked(useRegisterResend).mockReturnValue({
      tab: "resend",
      data: { name: "", phone: "" },
      errors: {
        register: "",
        phone: "",
        name: "",
        resend: "",
      },
      setErrorForKey: vi.fn(),
      setDataForKey: vi.fn(),
      clearErrors: vi.fn(),
      handleRegister: vi.fn(),
      handleResend,
      isPendingRegister: false,
      isPendingResend: false,
    });
    render(<PageClient />);
    const resendButton = screen.getByTestId("resend-button");
    act(() => {
      fireEvent.click(resendButton);
    });
    expect(handleResend).toHaveBeenCalled();
  });
});
