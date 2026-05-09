import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import LoadingSpinner from "./LoadingSpinner";
import MovieTable from "./MovieTable";
import Navbar from "./Navbar";
import RatingBadge from "./RatingBadge";
import { renderWithRouter } from "../test/test-utils.jsx";

function LocationProbe() {
  return <span data-testid="location">{useLocation().pathname}</span>;
}

describe("shared components", () => {
  it("renders status components and rating variants", () => {
    renderWithRouter(
      <>
        <ErrorMessage message="Broken" />
        <LoadingSpinner message="Working" />
        <RatingBadge value={8.26} />
        <RatingBadge value={5.1} />
        <RatingBadge value={3} />
        <RatingBadge value={null} />
      </>,
    );

    expect(screen.getByText("Broken")).toBeInTheDocument();
    expect(screen.getByText("Working")).toBeInTheDocument();
    expect(screen.getByText("8.3")).toBeInTheDocument();
    expect(screen.getByText("5.1")).toBeInTheDocument();
    expect(screen.getByText("3.0")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders navbar links", () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByRole("link", { name: "Movie Insights" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Analytics" })).toHaveAttribute("href", "/analytics");
  });

  it("renders empty movie tables and navigates on row click", () => {
    renderWithRouter(<MovieTable movies={[]} />);
    expect(screen.getByText("No movies found.")).toBeInTheDocument();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={(
              <>
                <MovieTable movies={[{ imdbId: "tt1", primaryTitle: "Movie", voteAverage: 7.4 }]} />
                <LocationProbe />
              </>
            )}
          />
          <Route path="/movies/:imdbId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Movie"));
    expect(screen.getByTestId("location")).toHaveTextContent("/movies/tt1");
  });
});
