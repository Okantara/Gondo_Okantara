import { ReactNode } from "react";
import { useTrackVisitor } from "@/hooks/useTrackVisitor";

interface TrackingWrapperProps {
  children: ReactNode;
}

export function TrackingWrapper({ children }: TrackingWrapperProps) {
  useTrackVisitor();

  return <>{children}</>;
}
