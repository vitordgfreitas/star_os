import { Suspense } from "react";
import { LoginPage } from "@/components/auth/LoginPage";

export default function LoginRoute() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-slate-500">Carregando...</div>}>
      <LoginPage />
    </Suspense>
  );
}
