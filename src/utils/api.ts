import { getToken } from "./localStorage";

export const createAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const handleApiResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || "API request failed");
    }
    
    return data;
  }
  
  if (!response.ok) {
    throw new Error("API request failed");
  }
  
  return null;
};

export const apiRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<any> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...createAuthHeaders(),
      ...options.headers,
    },
  });
  
  return handleApiResponse(response);
};

export const createApiResponse = (
  data: any = null, 
  success: boolean = true, 
  status: number = 200
) => {
  return Response.json(
    { success, ...(data ? { data } : {}) },
    { status }
  );
};

export const createErrorResponse = (
  error: string, 
  status: number = 400
) => {
  return Response.json(
    { success: false, error },
    { status }
  );
};