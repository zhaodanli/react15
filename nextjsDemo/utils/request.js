import axios from "axios";

// 在跨域携带cookie
axios.defaults.withCredentials = true;

const request = axios.create({
    baseURL: "http://localhost:8080",
});

export default request;