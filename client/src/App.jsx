import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import ActorPage from "./pages/ActorPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import UserRatingsPage from "./pages/UserRatingsPage";
import styles from "./App.module.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies/:imdbId" element={<MovieDetailPage />} />
          <Route path="/actors/:actorId" element={<ActorPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/users/:userId" element={<UserRatingsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
