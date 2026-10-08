import { createFileRoute } from "@tanstack/react-router";
import { SectionLayout } from "@/components/section-layout";

export const Route = createFileRoute("/intentions")({
  component: IntentionsLayout,
});

function IntentionsLayout() {
  return <SectionLayout sectionId="intentions" />;
}
