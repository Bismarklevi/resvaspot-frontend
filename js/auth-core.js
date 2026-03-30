/**
 * resvaspot/js/auth-core.js
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 * Core authentication logic shared across all pages.
 * Handles JWT storage, user session, and auth-protected fetches.
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 */

const API_BASE = "https://resvaspot-backend.onrender.com/api";

const getToken = () => localStorage.getItem("rv_token");
const getUser = () => JSON.parse(localStorage.getItem("rv_user") || "null");
const setToken = (token) => localStorage.setItem("rv_token", token);
const setUser = (user) => localStorage.setItem("rv_user", JSON.stringify(user));
const clearAuth = () => {
  localStorage.removeItem("rv_token");
  localStorage.removeItem("rv_user");
};
const isAuthenticated = () => Boolean(getToken());
const isProvider = () => getUser()?.role === "provider";
const isPagesPath = () => window.location.pathname.includes("/pages/");
const getCurrentPagePath = () => {
  const page = window.location.pathname.split("/").pop() || "index.html";
  return `${page}${window.location.search || ""}${window.location.hash || ""}`;
};
const sanitizeReturnTo = (value = "") => {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith("//")) return "";
  if (trimmed.includes("\r") || trimmed.includes("\n")) return "";
  if (trimmed.startsWith("../")) return "";
  if (trimmed.startsWith("/pages/")) return trimmed.slice("/pages/".length);
  if (trimmed.startsWith("/")) return trimmed.slice(1);

  return trimmed;
};
const getSignInPath = () => (isPagesPath() ? "signin.html" : "pages/signin.html");
const buildSignInUrl = ({ returnTo = "", mode = "" } = {}) => {
  const params = new URLSearchParams();
  const safeReturnTo = sanitizeReturnTo(returnTo);

  if (mode) params.set("mode", mode);
  if (safeReturnTo) params.set("returnTo", safeReturnTo);

  const query = params.toString();
  return query ? `${getSignInPath()}?${query}` : getSignInPath();
};
const redirectToSignIn = (options = {}) => {
  window.location.href = buildSignInUrl(options);
};
const requireAuth = (redirectPath) => {
  if (isAuthenticated()) return true;

  if (redirectPath) {
    window.location.href = redirectPath;
    return false;
  }

  redirectToSignIn({ returnTo: getCurrentPagePath() });
  return false;
};
const protectAction = (event, returnTo = "") => {
  if (isAuthenticated()) return true;

  event?.preventDefault?.();
  event?.stopPropagation?.();
  redirectToSignIn({ returnTo: sanitizeReturnTo(returnTo) || getCurrentPagePath() });
  return false;
};
const bindProtectedActions = (root = document) => {
  if (!root || root.__rvAuthProtectedActionsBound) return;
  root.__rvAuthProtectedActionsBound = true;

  root.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-auth-required]");
    if (!trigger || isAuthenticated()) return;

    const explicitReturn = sanitizeReturnTo(trigger.dataset.authReturn || "");
    const href = trigger.getAttribute("href") || "";
    protectAction(event, explicitReturn || href);
  });
};

window.rvAuth = {
  API_BASE,
  getToken,
  getUser,
  setToken,
  setUser,
  clearAuth,
  isAuthenticated,
  isProvider,
  getCurrentPagePath,
  sanitizeReturnTo,
  buildSignInUrl,
  redirectToSignIn,
  requireAuth,
  protectAction,
  bindProtectedActions,
  /** Fetch with the stored JWT attached automatically. */
  authFetch: (url, opts = {}) => {
    const token = getToken();
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    return fetch(fullUrl, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
  },
};
