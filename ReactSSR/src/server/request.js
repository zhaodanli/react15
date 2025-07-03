import axios from 'axios'

const request = (req) => axios.create({
  baseURL: 'http://localhost:8080/',
  headers: { // 携带 cookie
    cookie: req.get('cookie') || ''
  }
});
export default request