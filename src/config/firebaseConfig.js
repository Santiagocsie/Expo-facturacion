

// src/config/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    initializeAuth, 
    getReactNativePersistence 
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 
import { getFirestore } from 'firebase/firestore';

// 1. Reemplaza estas credenciales con las tuyas de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCntGvrL0kqtiK9GAjiPxyzMct8V9vkyCg",
  authDomain: "computercityfacturacion.firebaseapp.com",
  projectId: "computercityfacturacion",
  storageBucket: "computercityfacturacion.appspot.com",
  messagingSenderId: "373209035675",
  appId: "1:373209035675:android:c5026f2451c64a108a273e",
};

// Inicializar Firebase App
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);


// Inicializar Auth con Persistencia
// Esto evita la advertencia y asegura que la sesión del usuario se mantenga
//const auth = initializeAuth(app, {
//  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
//});

// Inicializar Firestore (Base de Datos)
//const db = getFirestore(app);

//export { auth, db };