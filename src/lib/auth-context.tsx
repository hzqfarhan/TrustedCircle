"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Wallet } from "@prisma/client";

type UserWithWallet = User & { wallet: Wallet | null };

interface AuthContextType {
  currentUser: UserWithWallet | null;
  setCurrentUserId: (id: string) => void;
  users: UserWithWallet[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUserId: () => {},
  users: [],
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children, initialUsers }: { children: React.ReactNode; initialUsers: UserWithWallet[] }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // try loading from localstorage
    const stored = localStorage.getItem("demo_user_id");
    if (stored && initialUsers.find((u) => u.id === stored)) {
      setUserId(stored);
    } else if (initialUsers.length > 0) {
      setUserId(initialUsers[0].id); // default to first user (Akmal)
    }
    setIsLoading(false);
  }, [initialUsers]);

  const handleSetUser = (id: string) => {
    setUserId(id);
    localStorage.setItem("demo_user_id", id);
  };

  const currentUser = initialUsers.find((u) => u.id === userId) || null;

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUserId: handleSetUser, users: initialUsers, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
