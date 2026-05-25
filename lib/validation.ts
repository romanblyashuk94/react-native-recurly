const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldResult = string | null;

export const validateEmail = (value: string): FieldResult => {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address";
  return null;
};

export const validatePassword = (
  value: string,
  { minLength = 8 }: { minLength?: number } = {},
): FieldResult => {
  if (!value) return "Password is required";
  if (value.length < minLength)
    return `Password must be at least ${minLength} characters`;
  if (!/[A-Za-z]/.test(value))
    return "Password must contain at least one letter";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number";
  return null;
};

export const validateVerificationCode = (value: string): FieldResult => {
  const trimmed = value.trim();
  if (!trimmed) return "Enter the code we sent you";
  if (!/^\d{6}$/.test(trimmed))
    return "Verification code must be 6 digits";
  return null;
};
