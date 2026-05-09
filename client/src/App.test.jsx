import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the routed shell", () => {
    render(<App />);
    expect(screen.getAllByText("Movie Insights").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Movie Insights" })).toBeInTheDocument();
  });
});
