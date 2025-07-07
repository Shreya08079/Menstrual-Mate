import type { User } from "@shared/schema";

export interface AuthToken {
  user: User;
  expiresAt: number;
}

export function storeAuthData(user: User): void {
  const authData = {
    user,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  localStorage.setItem("period-tracker-auth", JSON.stringify(authData));
}

export function getStoredAuthData(): User | null {
  try {
    const stored = localStorage.getItem("period-tracker-auth");
    if (!stored) return null;
    
    const authData: AuthToken = JSON.parse(stored);
    
    // Check if token is expired
    if (Date.now() > authData.expiresAt) {
      localStorage.removeItem("period-tracker-auth");
      return null;
    }
    
    return authData.user;
  } catch (error) {
    console.error("Error parsing stored auth data:", error);
    localStorage.removeItem("period-tracker-auth");
    return null;
  }
}

export function clearAuthData(): void {
  localStorage.removeItem("period-tracker-auth");
  localStorage.removeItem("period-tracker-user"); // Legacy cleanup
}

export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateUsername(name: string): string {
  // Generate a username from the name by removing spaces and adding random numbers
  const baseUsername = name.toLowerCase().replace(/\s+/g, "");
  const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `${baseUsername}${randomSuffix}`;
}

export function formatUserDisplayName(user: User): string {
  return user.name || user.username || "User";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

// Session management utilities
export function isUserSessionValid(): boolean {
  const user = getStoredAuthData();
  return user !== null;
}

export function refreshAuthToken(user: User): void {
  storeAuthData(user);
}

// Password strength indicator
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  if (score <= 2) {
    return { score, feedback: "Weak", color: "text-red-500" };
  } else if (score <= 4) {
    return { score, feedback: "Medium", color: "text-yellow-500" };
  } else {
    return { score, feedback: "Strong", color: "text-green-500" };
  }
}
