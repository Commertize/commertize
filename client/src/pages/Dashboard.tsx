// Legacy Dashboard - Redirects to new Portfolio Overview
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to new portfolio overview
    setLocation('/portfolio');
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-medium">Redirecting to Portfolio...</h1>
      </div>
    </div>
  );
}