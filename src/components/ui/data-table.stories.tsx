"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./badge";
import { DataTable } from "./data-table";

const meta = {
  title: "UI/DataTable",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Row = {
  id: string;
  integration: string;
  status: string;
};

const rows: Row[] = [
  { id: "1", integration: "NetSuite export", status: "healthy" },
  { id: "2", integration: "Workday payloads", status: "degraded" },
  { id: "3", integration: "Custom SFTP vault", status: "healthy" },
];

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "integration",
    header: "Integration",
    cell: ({ row }) => <span className="font-medium">{row.original.integration}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "healthy" ? "success" : "warning"}>{row.original.status}</Badge>
    ),
  },
];

export const PaginatedTanStackSurface: StoryObj = {
  render: () => <DataTable columns={columns} data={rows} />,
};

export const Empty: StoryObj = {
  render: () => <DataTable columns={columns} data={[]} emptyMessage="No integrations registered." />,
};
