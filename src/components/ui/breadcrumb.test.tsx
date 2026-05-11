/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

describe("Breadcrumb primitives", () => {
  afterEach(() => cleanup());

  it("renders nav with breadcrumb landmarks", () => {
    render(
      <Breadcrumb className="w-full">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveAttribute(
      "data-slot",
      "breadcrumb",
    );
  });

  it("marks the current page and uses default chevron separator", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage id="here">Here</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="sep" />
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const page = screen.getByText("Here");
    expect(page).toHaveAttribute("aria-current", "page");
    expect(page).toHaveAttribute("aria-disabled", "true");
    const sep = screen.getByTestId("sep").querySelector("svg");
    expect(sep).toBeTruthy();
  });

  it("supports asChild composition on BreadcrumbLink", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button type="button">Custom</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByRole("button", { name: "Custom" })).toHaveAttribute("data-slot", "breadcrumb-link");
  });

  it("renders custom separator children and exposes ellipsis screen-reader text", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator>·</BreadcrumbSeparator>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByText("More")).toBeInTheDocument();
    expect(screen.getByText("·")).toBeInTheDocument();
  });
});
