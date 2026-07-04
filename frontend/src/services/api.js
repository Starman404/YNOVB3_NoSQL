import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"
});

export const searchArtists = (query) =>
  api.get("/search/artists", { params: { query } }).then((r) => r.data);

export const importArtist = (mbid) =>
  api.post("/import/artists", { mbid }).then((r) => r.data);

export const getArtists = () => api.get("/artists").then((r) => r.data);

export const getArtist = (id) => api.get(`/artists/${id}`).then((r) => r.data);

export const getArtistRecordings = (id) =>
  api.get(`/artists/${id}/recordings`).then((r) => r.data);

export const getArtistReleases = (id) =>
  api.get(`/artists/${id}/releases`).then((r) => r.data);

export const getArtistCollaborations = (id) =>
  api.get(`/artists/${id}/collaborations`).then((r) => r.data);

export const getGraph = () => api.get("/graph").then((r) => r.data);

export const getArtistGraph = (id) =>
  api.get(`/graph/artists/${id}`).then((r) => r.data);

export const getStatsOverview = () =>
  api.get("/stats/overview").then((r) => r.data);

export const getTopArtists = () =>
  api.get("/stats/top-artists").then((r) => r.data);

export const getTopCollaborations = () =>
  api.get("/stats/top-collaborations").then((r) => r.data);

export const getTopGenres = () =>
  api.get("/stats/top-genres").then((r) => r.data);

export default api;
