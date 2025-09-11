export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getUserData = (): any | null => {
  const userStr = localStorage.getItem("utente");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const setUserData = (userData: any): void => {
  localStorage.setItem("utente", JSON.stringify(userData));
};

export const clearAuthData = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("utente");
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  const userData = getUserData();
  return !!(token && userData);
};
