import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const searchArtists = (q: string) =>
  api.get('/search/artists', { params: { q } }).then((r) => r.data);

export const importArtist = (mbid: string) =>
  api.post('/import/artists', { mbid }).then((r) => r.data);

export const getArtists = () =>
  api.get('/artists').then((r) => r.data);

export const getArtist = (id: string) =>
  api.get(`/artists/${id}`).then((r) => r.data);

export const getArtistRecordings = (id: string) =>
  api.get(`/artists/${id}/recordings`).then((r) => r.data);

export const getArtistReleases = (id: string) =>
  api.get(`/artists/${id}/releases`).then((r) => r.data);

export const getArtistCollaborations = (id: string) =>
  api.get(`/artists/${id}/collaborations`).then((r) => r.data);

export const getRecordings = () =>
  api.get('/recordings').then((r) => r.data);

export const getGraphData = () =>
  api.get('/graph').then((r) => r.data);

export const getArtistGraph = (id: string) =>
  api.get(`/graph/artists/${id}`).then((r) => r.data);

export const getCollaborationsGraph = () =>
  api.get('/graph/collaborations').then((r) => r.data);

export const getShortestPath = (from: string, to: string) =>
  api.get('/graph/path', { params: { from, to } }).then((r) => r.data);

export const getStatsOverview = () =>
  api.get('/stats/overview').then((r) => r.data);

export const getTopArtists = () =>
  api.get('/stats/top-artists').then((r) => r.data);

export const getTopCollaborations = () =>
  api.get('/stats/top-collaborations').then((r) => r.data);

export const getTopGenres = () =>
  api.get('/stats/top-genres').then((r) => r.data);
