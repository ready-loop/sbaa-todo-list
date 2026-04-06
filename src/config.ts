/** Backend API URL. Empty string = relative (use Vite dev proxy). */
export const API_URL = import.meta.env.VITE_API_URL ?? '';

/** SBAA app key override for local development. */
export const APP_KEY = import.meta.env.VITE_APP_KEY ?? '';

/** App display name shown in the header. */
export const APP_NAME = 'Todo List';

/** Tagline shown on the login screen. */
export const APP_TAGLINE = 'AI-powered task management';
