import axios from "axios";

import { getAccessToken } from "@/services/auth-storage";

const API_BASE_URL = "http://localhost:8000";

// Endpoints where a 401 means "these credentials were wrong," not
// "your session expired" — the global logout handler must not fire for these.
const UNAUTHENTICATED_ENDPOINTS = ["/users/login", "/users"];

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let onUnauthorized: (() => void | Promise<void>) | null = null;
let isHandlingUnauthorized = false;

export function setUnauthorizedHandler(
  handler: () => void | Promise<void>
): void {
  onUnauthorized = handler;
}

function isUnauthenticatedEndpoint(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  const path = url.replace(API_BASE_URL, "");
  return UNAUTHENTICATED_ENDPOINTS.some(
    (endpoint) => path === endpoint || path.startsWith(`${endpoint}?`)
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string | undefined = error.config?.url;

    if (
      status === 401 &&
      !isUnauthenticatedEndpoint(requestUrl) &&
      !isHandlingUnauthorized &&
      onUnauthorized
    ) {
      isHandlingUnauthorized = true;
      Promise.resolve(onUnauthorized()).finally(() => {
        isHandlingUnauthorized = false;
      });
    }

    return Promise.reject(error);
  }
);
