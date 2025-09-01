import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expect, describe, it, vi } from "vitest";
import Layout from "./layout";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("?tab=register"),
  usePathname: () => "/",
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

describe("Root Layout", () => {
  it("should render the layout", () => {
    // this outputs a warning during test: In HTML, <html> cannot be a child of <div>.This will cause a hydration error. Just ignore it. Don't know how to tell render not to use a div as the root element.
    render(
      <Layout>
        <div>
          <h1>Layout</h1>
        </div>
      </Layout>
    );
    expect(screen.getByText("Layout")).toBeInTheDocument();
  });
});
