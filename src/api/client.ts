import axios from 'axios';

const base = import.meta.env.BASE_URL; // "/" in dev, "/repo-name/" in prod

export const api = axios.create({
  baseURL: `${base}api`,
  timeout: 10_000,
});