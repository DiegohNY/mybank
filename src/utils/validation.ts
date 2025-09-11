export const validateAmount = (amount: string | number): number => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error("L'importo deve essere un numero positivo");
  }

  if (numAmount > 50000) {
    throw new Error("L'importo massimo consentito è €50.000");
  }

  return numAmount;
};

export const validateAccountId = (accountId: string | number): number => {
  const numAccountId =
    typeof accountId === "string" ? parseInt(accountId) : accountId;

  if (isNaN(numAccountId) || numAccountId <= 0) {
    throw new Error("ID conto non valido");
  }

  return numAccountId;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRequired = (value: string, fieldName?: string): void => {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName || "Campo"} obbligatorio`);
  }
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): void => {
  if (password !== confirmPassword) {
    throw new Error("Le password non corrispondono");
  }
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>'"%;()&+]/g, "");
};

export const validateName = (name: string): void => {
  if (!name || name.trim().length < 2) {
    throw new Error("Il nome deve contenere almeno 2 caratteri");
  }
  if (name.trim().length > 50) {
    throw new Error("Il nome non può superare 50 caratteri");
  }
};
