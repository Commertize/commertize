import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const isAdmin = sessionStorage.getItem("isAdmin") === "true";
  return isAdmin ? <>{children}</> : null;
}
