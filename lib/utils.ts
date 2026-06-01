/**
 * Formats a given number into Bangladeshi Taka (BDT) formatting
 */
export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString("bn-BD")}`;
}

/**
 * Generates a unique, high-entropy transaction ID for transaction collection records
 */
export function generateTransactionId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";
  for (let i = 0; i < 8; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TXN-${Date.now()}-${randomString}`;
}
