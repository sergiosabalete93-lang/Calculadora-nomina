/* ==========================================================================
   FIREBASE-CONFIG.JS - El puente de conexión (CORREGIDO)
   ========================================================================== */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ⚠️ ATENCIÓN: Debes copiar estos valores reales de tu consola de Firebase
// Configuración del proyecto > Tus apps > Configuración del SDK
const firebaseConfig = {
  apiKey: "Sustituye_esto_por_tu_clave_larga_de_letras_y_numeros", 
  authDomain: "payroll-pro-pwa.firebaseapp.com",
  projectId: "payroll-pro-pwa",
  storageBucket: "payroll-pro-pwa.appspot.com",
  messagingSenderId: "Sustituye_esto_por_tu_numero_de_9_digitos",
  appId: "Sustituye_esto_por_tu_ID_de_app_que_empieza_por_1:..."
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas para que app.js pueda usarlas
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("Firebase: Conexión configurada correctamente.");
export default app;
