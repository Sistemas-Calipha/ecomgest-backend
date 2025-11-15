// assets/js/api.js

// Detecta si estamos en localhost o en producción
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://ecomgest-backend.onrender.com";

const api = {
  post: (endpoint, data) =>
    fetch(API_URL + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  get: (endpoint) =>
    fetch(API_URL + endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }),
};
