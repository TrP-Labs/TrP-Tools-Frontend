"use client";

import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/utilityComponents/AuthProvider";
import Loading from "@/components/Loading";

// Define the HOC that takes a component as an argument
const withAuthProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AuthenticatedComponent = (props: P) => {
    const router = useRouter();
    const sessionContext = useContext(AuthContext);
    const loading = sessionContext?.loaded;
    const user = sessionContext?.session;

    useEffect(() => {
      // Redirect to home if not loading and no user is found
      if (loading !== "loading" && !user) {
        router.push("/");
      }
    }, [loading, user, router]);

    // Display a loading indicator while authentication is in progress
    if (loading === "loading") {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loading
            title="Authenticating"
            description="Verifying you are logged in..."
          />
        </div>
      );
    }

    // Render the protected component once authenticated
    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuthProtection;
