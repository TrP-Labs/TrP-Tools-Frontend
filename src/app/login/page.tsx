"use client";

import { useEffect } from "react";
import { buildApiUrl } from "@/lib/api/http";

const LoginRedirectPage = () => {
  useEffect(() => {
    window.location.href = buildApiUrl("/auth/login");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Redirecting to TrP Tools login…</h1>
        <p className="text-[var(--text)] opacity-75">
          If you are not redirected automatically,{" "}
          <a className="text-blue-500 underline" href={buildApiUrl("/auth/login")}>
            click here to continue
          </a>.
        </p>
      </div>
    </div>
  );
};

export default LoginRedirectPage;
