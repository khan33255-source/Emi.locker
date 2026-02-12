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

    // Luhn Algorithm: Double every second digit from the right.
    // Since we check from left (index 0) to right (index 14) for a 15-digit number:
    // The digits to double are at indices 1, 3, 5, 7, 9, 11, 13
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  // The total sum must be divisible by 10
  return sum % 10 === 0;
}
