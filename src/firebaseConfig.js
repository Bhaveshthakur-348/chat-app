import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCwPI2IxjIPY8_UmvXLkD_vTulIrwjCUX0",
  authDomain: "message-app-d843c.firebaseapp.com",
  databaseURL: "https://message-app-d843c-default-rtdb.firebaseio.com/",
  projectId: "message-app-d843c",
  storageBucket: "message-app-d843c.appspot.com",
  messagingSenderId: "17400911811",
  appId: "1:17400911811:web:85940993f1d50846324f76"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;
