const BASE = "/api";

export async function getActorFilmography(actorId) {
  const res = await fetch(`${BASE}/actors/${actorId}/movies-with-financials`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Actor not found");
  return res.json();
}
