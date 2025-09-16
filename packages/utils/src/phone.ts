/**
 * Normalize the phone number to a standard format +(COUNTRY_CODE)(NUMBER)
 *
 * @param phone - The phone number to normalize.
 * @returns The normalized phone number.
 */
export const normalizePhone = (phone: string) => {
  if (phone.startsWith("+")) {
    // TEST#1
    return phone;
  }

  if (phone.startsWith("0")) {
    // TEST#2
    return `+${phone.slice(1)}`;
  }

  // TEST#3
  return `+${phone}`;
};
