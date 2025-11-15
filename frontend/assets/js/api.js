// assets/js/api.js

const API_URL = "http://localhost:3000";

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
