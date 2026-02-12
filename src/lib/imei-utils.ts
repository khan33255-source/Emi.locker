
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

    // Double every second digit from the right
    // For 15 digits, the odd indices (0, 2, 4...) are second from right in reverse
    // But standard Luhn on 15 digits usually doubles indices 1, 3, 5, 7, 9, 11, 13
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  return sum % 10 === 0;
}
