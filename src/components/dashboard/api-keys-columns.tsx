import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { ApiKeyListItem } from "./api-key-types";

export function buildApiKeyColumns(ctx: {
  onRevoke: (id: string) => void;
  revokePending: string | null;
}): ColumnDef<ApiKeyListItem, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Label",
      cell: ({ row }) => (
        <div className="grid max-w-xs gap-0.5">
          <span className="font-medium text-foreground">{row.original.name}</span>
          <span className="font-mono text-xs text-muted-foreground">{row.original.key_prefix}…</span>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground text-sm">
          {new Date(row.original.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: ({ row }) =>
        row.original.revoked_at ? <Badge variant="destructive">Revoked</Badge> : <Badge variant="success">Active</Badge>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.revoked_at ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            type="button"
            disabled={ctx.revokePending === row.original.id}
            onClick={() => void ctx.onRevoke(row.original.id)}
          >
            {ctx.revokePending === row.original.id ? "Revoking…" : "Revoke"}
          </Button>
        ),
    },
  ];
}
