import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mybank-secret-key-for-thesis";
const JWT_EXPIRES_IN = "24h";

export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (userId: number, email: string): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const extractUserIdFromToken = (token: string): number | null => {
  const payload = verifyToken(token);
  return payload ? payload.userId : null;
};
