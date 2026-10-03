/**
 * Reads a text field from submitted form data, returning "" if it's missing
 * or not text. Server Actions are public endpoints, so a hand-crafted request
 * can omit any field - this keeps that from crashing with a 500.
 */
export function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
