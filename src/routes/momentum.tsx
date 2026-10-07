import { createFileRoute } from "@tanstack/react-router";
import { SectionLayout } from "@/components/section-layout";

export const Route = createFileRoute("/momentum")({
  component: MomentumLayout,
});

function MomentumLayout() {
  return <SectionLayout sectionId="momentum" />;
}
