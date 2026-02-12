/**
 * Utility for IMEI validation using the Luhn Algorithm.
 */
export function validateIMEI(imei: string): boolean {
  // Check if it is a 15-digit number
  if (!/^\d{15}$/.test(imei)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei[i]);

    // Double every second digit
    if (i % 2 === 1) {
      digit *= 2;
      // If result is greater than 9, subtract 9 (same as adding digits)
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  // Total sum must be divisible by 10
  return sum % 10 === 0;
}
