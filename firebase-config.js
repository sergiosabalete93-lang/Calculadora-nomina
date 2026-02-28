// Importamos las funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ESTOS DATOS LOS SACAS DE LA CONSOLA DE FIREBASE (PASO A ANTERIOR)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "payroll-pro-pwa.firebaseapp.com",
  projectId: "payroll-pro-pwa",
  storageBucket: "payroll-pro-pwa.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:12345:web:6789"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas para usarlas en toda la app
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
