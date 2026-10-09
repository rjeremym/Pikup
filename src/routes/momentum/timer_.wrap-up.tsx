import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/momentum/timer_/wrap-up")({
  component: () => <Navigate to="/momentum/timer" replace />,
});
