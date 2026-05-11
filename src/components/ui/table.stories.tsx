import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table";

const meta = {
  title: "UI/Table",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const Default: StoryObj = {
  render: () => (
    <Table>
      <TableCaption>Live aggregates from orchestration probes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Region</TableHead>
          <TableHead>Throughput</TableHead>
          <TableHead>P95 latency</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium text-foreground">IAD edge</TableCell>
          <TableCell>12.4k RPS</TableCell>
          <TableCell>118 ms</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium text-foreground">FRA edge</TableCell>
          <TableCell>10.9k RPS</TableCell>
          <TableCell>132 ms</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
