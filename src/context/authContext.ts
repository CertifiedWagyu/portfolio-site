import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthValue {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  configMissing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

export const AuthContext = createContext<AuthValue | null>(null);
