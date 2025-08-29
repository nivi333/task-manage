import React from "react";
import { render, screen } from "@testing-library/react";
import DocsLink from "../DocsLink";

describe("DocsLink", () => {
  test("renders valid link with target _blank", () => {
    render(<DocsLink href="https://example.com/docs" label="Docs" />);
    const link = screen.getByRole("link", { name: /open documentation: docs/i });
    expect(link).toHaveAttribute("href", "https://example.com/docs");
    expect(link).toHaveAttribute("target", "_blank");
  });

  test("shows invalid notice for bad url", () => {
    render(<DocsLink href="javascript:alert(1)" label="Bad" />);
    expect(screen.getByText(/invalid url/i)).toBeInTheDocument();
  });
});
