import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const setUserHeaders = (user) => {
  api.defaults.headers.common["X-USER-ID"] = user.id;
  api.defaults.headers.common["X-USER-ROLE"] = user.role;
};

export default api;
