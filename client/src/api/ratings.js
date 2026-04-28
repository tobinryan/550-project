const BASE = "/api";

export async function getUserRatings(userId) {
  const res = await fetch(`${BASE}/ratings/user/${userId}`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Fetch failed");
  return res.json();
}
