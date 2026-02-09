const API_BASE = "http://localhost:8080";

export async function getFiles() {
  const res = await fetch(`${API_BASE}/api/files`);
  if (!res.ok) {
    throw new Error("Failed to fetch files");
  }
  return res.json();
}
