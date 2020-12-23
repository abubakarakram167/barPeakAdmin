import axios from 'axios';

const environment = process.env.NODE_ENV || 'development';
var url = '';
if(environment === "development"){
  url = 'http://localhost:3000/'
}
else
  url = 'https://counterflowbarpeak-backend-app.herokuapp.com/'

console.log("the url", url);  

export default axios.create({
  baseURL: url
})