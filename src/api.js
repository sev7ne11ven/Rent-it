import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000" }); // FastAPI backend

export const getItems = () => API.get("/items");
export const getRecommendations = () => API.get("/recommendations");
export const rentItem = (itemId, days) => API.post("/rent_item", { item_id: itemId, days });
export const chatBot = (query) => API.post("/chatbot", { query });
