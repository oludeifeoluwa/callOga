export interface PasswordCheckResult {
  valid: boolean;
  length: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function validatePassword(password: string): PasswordCheckResult {
  const length = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return {
    valid: length && hasUpper && hasLower && hasNumber && hasSpecial,
    length,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial
  };
}
