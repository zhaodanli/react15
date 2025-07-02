import axios from 'axios'
const request = axios.create({
  baseURI: '/'
});
export default request