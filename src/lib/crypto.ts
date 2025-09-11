import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const validatePasswordStrength = (
  password: string
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("La password deve essere almeno 6 caratteri");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("La password deve contenere almeno 1 maiuscola");
  }

  return { valid: errors.length === 0, errors };
};
