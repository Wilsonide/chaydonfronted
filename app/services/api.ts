import axios from "axios";

import { useAuthStore } from "@/app/store/auth-store";
import AuthService from "./auth.service";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";

    /*
     * IMPORTANT:
     * Never try to refresh when the failed request
     * is already the refresh endpoint.
     *
     * Otherwise:
     *
     * /auth/refresh → 401
     *      ↓
     * interceptor tries /auth/refresh again
     *      ↓
     * 401
     *      ↓
     * loop
     */
    const isRefreshRequest = requestUrl.includes("/auth/refresh");

    if (status === 401 && !isRefreshRequest && !originalRequest?._retry) {
      originalRequest._retry = true;

      /*
       * If another request is already refreshing the token,
       * wait for that same request instead of creating another one.
       */
      if (!refreshPromise) {
        refreshPromise = AuthService.refresh()
          .then((res) => {
            const token = res.data.access_token;

            if (!token) {
              throw new Error(
                "Refresh response did not contain an access token.",
              );
            }

            useAuthStore.getState().setAccessToken(token);

            return token;
          })
          .catch((refreshError) => {
            console.error("Session refresh failed:", refreshError);

            /*
             * Refresh token/session is no longer valid.
             *
             * This covers:
             * - expired refresh token
             * - revoked session
             * - invalid refresh token
             * - missing refresh session
             */
            useAuthStore.setState({
              accessToken: null,
              user: null,
            });

            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const token = await refreshPromise;

      /*
       * Refresh failed.
       * The user is no longer authenticated.
       */
      if (!token) {
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname + window.location.search;

          /*
           * Avoid repeatedly redirecting if already on login.
           */
          if (!window.location.pathname.startsWith("/login")) {
            const loginUrl = `/login?redirect=${encodeURIComponent(
              currentPath,
            )}`;

            window.location.replace(loginUrl);
          }
        }

        return Promise.reject(error);
      }

      /*
       * We successfully refreshed the access token.
       * Retry the original request with the new token.
       */
      originalRequest.headers = originalRequest.headers ?? {};

      originalRequest.headers.Authorization = `Bearer ${token}`;

      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default api;
