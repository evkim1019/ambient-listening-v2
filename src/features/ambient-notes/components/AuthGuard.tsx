import type { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard wrapper component.
 * Currently a simple pass-through. Real Amplify Auth checking
 * will be integrated in a later task.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>;
}
