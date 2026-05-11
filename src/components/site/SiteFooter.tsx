import { AuthLinks } from "@/components/site/AuthLinks";
import { TextLink } from "@/components/ui/text-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40 py-8 text-center backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-6">
        <AuthLinks />
        <TextLink href="/releases" variant="muted">
          Release notes
        </TextLink>
      </div>
    </footer>
  );
}
