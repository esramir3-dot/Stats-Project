const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "Request failed");
  }

  return data;
}

export const dormEatsApi = {
  health: () => request("/health"),
  recipes: () => request("/recipes"),
  createRecipe: (recipe) =>
    request("/recipes", {
      method: "POST",
      body: recipe
    }),
  importRecipes: (payload) =>
    request("/recipes/import", {
      method: "POST",
      body: payload
    }),
  restaurants: () => request("/restaurants"),
  scenarios: () => request("/scenarios"),
  ingredientCatalog: () => request("/ingredients/catalog"),
  parseReceipt: (receiptText) =>
    request("/ingredients/parse-receipt", {
      method: "POST",
      body: { receiptText }
    }),
  recommendations: (payload) =>
    request("/recommendations", {
      method: "POST",
      body: payload
    })
};
