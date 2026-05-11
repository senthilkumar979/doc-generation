import { PageMain } from "@/components/ui/page-main";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <PageMain>
      <Skeleton className="h-8 w-[min(20rem,88vw)] max-w-md" />
      <div className="mt-8 flex flex-col gap-3">
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-[min(100%,28rem)]" />
        <Skeleton className="h-4 w-[min(100%,22rem)]" />
      </div>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </PageMain>
  );
}
