/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TemplateRowEditForm } from "./TemplateRowEditForm";

describe("TemplateRowEditForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows letter-specific fields when type is letter", () => {
    render(
      <TemplateRowEditForm
        template={{
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "L",
          template_type: "letter",
          payload: { subject: "Sub", content: "Body text" },
        }}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("Sub")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Body text")).toBeInTheDocument();
  });

  it("hides letter fields for blank templates", () => {
    render(
      <TemplateRowEditForm
        template={{
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "B",
          template_type: "blank",
          payload: {},
        }}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText(/Subject/)).not.toBeInTheDocument();
  });
});
