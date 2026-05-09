import { describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./HomePage";
import MovieDetailPage from "./MovieDetailPage";
import ActorPage from "./ActorPage";
import UserRatingsPage from "./UserRatingsPage";
import AnalyticsPage from "./AnalyticsPage";
import { renderWithRouter } from "../test/test-utils.jsx";
import {
  getMovie,
  getMovieCast,
  getMovieGenres,
  getMoviesByYear,
  searchMovies,
} from "../api/movies";
import { getActorFilmography } from "../api/actors";
import { getUserRatings } from "../api/ratings";
import {
  getActorPairs,
  getMoviesByGenreYear,
  getTopActorsByGross,
} from "../api/analytics";

vi.mock("../api/movies", () => ({
  searchMovies: vi.fn(),
  getMoviesByYear: vi.fn(),
  getMovie: vi.fn(),
  getMovieGenres: vi.fn(),
  getMovieCast: vi.fn(),
}));

vi.mock("../api/actors", () => ({
  getActorFilmography: vi.fn(),
}));

vi.mock("../api/ratings", () => ({
  getUserRatings: vi.fn(),
}));

vi.mock("../api/analytics", () => ({
  getMoviesByGenreYear: vi.fn(),
  getTopActorsByGross: vi.fn(),
  getActorPairs: vi.fn(),
}));

vi.mock("recharts", () => {
  const passthrough = ({ children }) => <div>{children}</div>;
  return {
    BarChart: passthrough,
    Bar: passthrough,
    XAxis: () => <span data-testid="x-axis" />,
    YAxis: () => <span data-testid="y-axis" />,
    Tooltip: () => <span data-testid="tooltip" />,
    ResponsiveContainer: passthrough,
    Cell: () => <span data-testid="cell" />,
  };
});

function LocationProbe() {
  return <span data-testid="location">{useLocation().pathname}</span>;
}

describe("pages", () => {
  it("searches by title, browses by year, and navigates to user ratings", async () => {
    searchMovies.mockResolvedValue({
      movies: [{ imdbId: "tt1", primaryTitle: "Inception", startYear: 2010, voteAverage: 8.8 }],
    });
    getMoviesByYear.mockResolvedValue({
      movies: [{ imdbId: "tt2", primaryTitle: "Memento", startYear: 2000, voteAverage: 8.4 }],
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={(
              <>
                <HomePage />
                <LocationProbe />
              </>
            )}
          />
          <Route path="/users/:userId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(searchMovies).not.toHaveBeenCalled();

    await userEvent.type(screen.getByPlaceholderText("e.g. Inception"), " Inception ");
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText("Inception")).toBeInTheDocument();
    expect(searchMovies).toHaveBeenCalledWith("Inception");

    fireEvent.click(screen.getByRole("button", { name: "Browse" }));
    expect(await screen.findByText("Memento")).toBeInTheDocument();
    expect(getMoviesByYear).toHaveBeenCalledWith(2000, 2010);

    await userEvent.type(screen.getByPlaceholderText("User ID"), "42");
    fireEvent.click(screen.getByRole("button", { name: "View Ratings" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/users/42");
  });

  it("shows HomePage API errors", async () => {
    searchMovies.mockRejectedValue(new Error("search failed"));
    getMoviesByYear.mockRejectedValue(new Error("years failed"));

    renderWithRouter(<HomePage />);
    await userEvent.type(screen.getByPlaceholderText("e.g. Inception"), "Bad");
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText("search failed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Browse" }));
    expect(await screen.findByText("years failed")).toBeInTheDocument();
  });

  it("renders movie details, formats empty values, and shows errors", async () => {
    getMovie.mockResolvedValue({
      imdbId: "tt1",
      primaryTitle: "Title",
      originalTitle: "Original",
      startYear: null,
      runtimeMinutes: 0,
      voteAverage: 7,
      voteCount: 0,
      revenue: 0,
    });
    getMovieGenres.mockResolvedValue({ genres: ["Drama"] });
    getMovieCast.mockResolvedValue({
      cast: [{ name: "Actor A", job: "Actor" }, { name: "Director D", job: "Director" }],
    });

    renderWithRouter(<MovieDetailPage />, { route: "/movies/tt1", path: "/movies/:imdbId" });
    expect(await screen.findByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Original: Original")).toBeInTheDocument();
    expect(screen.getByText("Drama")).toBeInTheDocument();
    expect(screen.getByText("Actor A")).toBeInTheDocument();
    expect(screen.getByText("Director D")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(1);

    getMovie.mockRejectedValue(new Error("movie failed"));
    getMovieGenres.mockResolvedValue({ genres: [] });
    getMovieCast.mockResolvedValue({ cast: [] });
    renderWithRouter(<MovieDetailPage />, { route: "/movies/bad", path: "/movies/:imdbId" });
    expect(await screen.findByText("movie failed")).toBeInTheDocument();
  });

  it("renders actor filmography states and navigates to movies", async () => {
    getActorFilmography.mockResolvedValueOnce({
      actorId: 1,
      actorName: "Performer",
      movies: [],
    });
    renderWithRouter(<ActorPage />, { route: "/actors/1", path: "/actors/:actorId" });
    expect(await screen.findByText("No filmography data found.")).toBeInTheDocument();

    getActorFilmography.mockResolvedValueOnce({
      actorId: 1,
      actorName: "Performer",
      movies: [{
        imdbId: "tt9",
        primaryTitle: "Hit",
        startYear: null,
        role: "Lead",
        budget: null,
        revenue: 2500000,
        productionCompany: null,
        avgMovieRating: 6.8,
        ratingVsCareer: "above",
      }],
    });
    render(
      <MemoryRouter initialEntries={["/actors/1"]}>
        <Routes>
          <Route path="/actors/:actorId" element={<ActorPage />} />
          <Route path="/movies/:imdbId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByText("Hit"));
    expect(screen.getByTestId("location")).toHaveTextContent("/movies/tt9");

    getActorFilmography.mockRejectedValueOnce(new Error("actor failed"));
    renderWithRouter(<ActorPage />, { route: "/actors/bad", path: "/actors/:actorId" });
    expect(await screen.findByText("actor failed")).toBeInTheDocument();
  });

  it("renders user ratings states and navigates to movie details", async () => {
    getUserRatings.mockResolvedValueOnce({ userId: 42, ratings: [] });
    renderWithRouter(<UserRatingsPage />, { route: "/users/42", path: "/users/:userId" });
    expect(await screen.findByText("No ratings found for this user.")).toBeInTheDocument();

    getUserRatings.mockResolvedValueOnce({
      userId: 42,
      ratings: [{ movieId: "tt10", rating: 4.24, timestamp: 1700000000 }],
    });
    render(
      <MemoryRouter initialEntries={["/users/42"]}>
        <Routes>
          <Route path="/users/:userId" element={<UserRatingsPage />} />
          <Route path="/movies/:imdbId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByTitle("4.24")).toHaveTextContent("4/5");
    fireEvent.click(screen.getByText("tt10"));
    expect(screen.getByTestId("location")).toHaveTextContent("/movies/tt10");

    getUserRatings.mockRejectedValueOnce(new Error("ratings failed"));
    renderWithRouter(<UserRatingsPage />, { route: "/users/bad", path: "/users/:userId" });
    expect(await screen.findByText("ratings failed")).toBeInTheDocument();
  });

  it("runs all analytics tabs and table navigation", async () => {
    getMoviesByGenreYear.mockResolvedValue({
      movies: [{
        primaryTitle: "Long Drama Movie Title That Needs Truncation",
        startYear: 2010,
        originalLanguage: null,
        genre: "Drama",
        topCompany: null,
        avgRating: 4.25,
        numRaters: 1234,
        genreRank: 1,
      }],
    });
    getTopActorsByGross.mockResolvedValue({
      actors: [{ actorId: 5, name: "Actor Gross", numMovies: 3, avgGross: 2500000 }],
    });
    getActorPairs.mockResolvedValue({
      pairs: [{
        actor1Id: 7,
        actor2Id: 8,
        actor1Name: "Pair A",
        actor2Name: "Pair B",
        sharedMovies: 4,
        avgSharedRating: 4.5,
      }],
    });

    render(
      <MemoryRouter initialEntries={["/analytics"]}>
        <Routes>
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/actors/:actorId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(await screen.findByText("Long Drama Movie Title That Needs Truncation")).toBeInTheDocument();
    expect(getMoviesByGenreYear).toHaveBeenCalledWith("Drama", 2000, 2015);

    fireEvent.click(screen.getByRole("button", { name: "Top Actors by Gross" }));
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(await screen.findByText("Actor Gross")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Actor Gross"));
    expect(screen.getByTestId("location")).toHaveTextContent("/actors/5");

    cleanup();
    render(
      <MemoryRouter initialEntries={["/analytics"]}>
        <Routes>
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/actors/:actorId" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Actor Pairs" }));
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    const row = await screen.findByText("Pair A");
    expect(row).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pair B" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/actors/8");
  });

  it("shows analytics tab errors", async () => {
    getMoviesByGenreYear.mockRejectedValue(new Error("analytics failed"));
    renderWithRouter(<AnalyticsPage />, { route: "/analytics", path: "/analytics" });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(await screen.findByText("analytics failed")).toBeInTheDocument();

    getTopActorsByGross.mockRejectedValue(new Error("gross failed"));
    fireEvent.click(screen.getByRole("button", { name: "Top Actors by Gross" }));
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(await screen.findByText("gross failed")).toBeInTheDocument();

    getActorPairs.mockRejectedValue(new Error("pairs failed"));
    fireEvent.click(screen.getByRole("button", { name: "Actor Pairs" }));
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(await screen.findByText("pairs failed")).toBeInTheDocument();
  });
});
