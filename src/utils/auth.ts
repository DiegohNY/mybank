import { getToken, getUserData, clearAuthData } from "./localStorage";

export const checkUserLogin = (router: any): any | null => {
  if (typeof window === "undefined") return null;

  const token = getToken();
  const userData = getUserData();

  if (!token || !userData) {
    router.push("/login");
    return null;
  }

  // Verifica se il token è scaduto decodificandolo lato client
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      clearAuthData();
      router.push("/login");
      return null;
    }
  } catch (error) {
    clearAuthData();
    router.push("/login");
    return null;
  }

  return userData;
};

export const handleLogout = (router: any): void => {
  clearAuthData();
  router.push("/");
};

export const getUserInitials = (userData: any): string => {
  if (!userData?.first_name || !userData?.last_name) return "??";
  return `${userData.first_name.charAt(0)}${userData.last_name.charAt(
    0
  )}`.toUpperCase();
};
