"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../convex/_generated/api";

export default function UserSync() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const storeUser = useMutation(api.users.storeUser);
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && syncedUserIdRef.current !== user.id) {
      storeUser({
        name: user.fullName || user.username || undefined,
        email: user.primaryEmailAddress?.emailAddress || undefined,
        imageUrl: user.imageUrl || undefined,
      })
        .then(() => {
          syncedUserIdRef.current = user.id;
        })
        .catch((err) => {
          // If Convex auth provider is not yet activated on the backend
          console.warn("User sync to Convex:", err);
        });
    } else if (!isAuthenticated) {
      syncedUserIdRef.current = null;
    }
  }, [isLoading, isAuthenticated, user, storeUser]);

  return null;
}
