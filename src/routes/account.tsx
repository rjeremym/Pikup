import { createFileRoute } from "@tanstack/react-router";
import { SectionLayout } from "@/components/section-layout";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

function AccountLayout() {
  return <SectionLayout sectionId="account" />;
}
