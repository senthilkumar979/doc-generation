import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { TextLink } from "@/components/ui/text-link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center px-4 py-16">
      <p className="text-accent text-xs font-semibold tracking-[0.28em] uppercase">DocRail</p>
      <Heading className="mt-4 text-[1.75rem] tracking-tight sm:text-3xl">Enterprise documents from structured data</Heading>
      <Text muted className="mt-6 text-lg leading-relaxed">
        API, templates, PDF generation, and delivery—built step by step. Follow public{" "}
        <TextLink href="/releases" variant="accent" className="text-base font-medium">
          release notes
        </TextLink>{" "}
        for user-visible changes.
      </Text>
    </main>
  );
}
