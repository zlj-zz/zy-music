import axios from "axios";

//const BASIC_URL = "http://zacharyzlj.cn:3000/";
const BASIC_URL = "http://localhost:3000/";

function createBaseInstance() {
  const instance = axios.create({ baseURL: BASIC_URL });

  return instance;
}

export const requset = createBaseInstance();