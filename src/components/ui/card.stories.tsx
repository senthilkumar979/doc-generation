import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta = {
  title: "UI/Card",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>API key issuance</CardTitle>
        <CardDescription>Name keys by integration so audit logs remain legible downstream.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Tokens are salted with rotating pepper material and hashed at rest.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-border/70">
        <Button variant="ghost" size="sm">
          Audit trail
        </Button>
        <Button size="sm">Generate key</Button>
      </CardFooter>
    </Card>
  ),
};
