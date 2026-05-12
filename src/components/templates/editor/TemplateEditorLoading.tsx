import { Skeleton } from "@/components/ui/skeleton";

export function TemplateEditorLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-muted/[0.22]">
      <div className="flex h-16 items-center gap-3 border-b border-border bg-background px-4">
        <Skeleton className="h-10 w-80" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-[240px_minmax(0,1fr)_280px]">
        <div className="space-y-3 border-r border-border bg-background p-4">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
        <div className="p-8">
          <Skeleton className="mx-auto h-[900px] w-[640px]" />
        </div>
        <div className="space-y-3 border-l border-border bg-background p-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
