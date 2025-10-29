// index.js
import React, { useEffect } from 'react';
import AppNavigator from '../src/navigation/AppNavigator';

// 1. Importa la configuración y la base de datos (db)
//import { db } from '../src/config/firebaseConfig'; 
//import { collection, addDoc } from 'firebase/firestore'; // Funciones de Firestore

export default function App() {
//  

// Probar conexion a la base de datos

//  useEffect(() => {
//    // 2. Función para probar la escritura en Firestore
//    const testFirestoreConnection = async () => {
//      try {
//        const docRef = await addDoc(collection(db, "_CONNECTION_TEST"), {
//          message: "¡Conexión exitosa a Firestore!",
//          timestamp: new Date().toISOString(),
//          appVersion: "1.0.0"
//        });
//        console.log(" PRUEBA DE FIREBASE EXITOSA: Documento escrito con ID: ", docRef.id);
//        console.log(" Revisa tu consola de Firebase en Firestore Database.");
//
//      } catch (e) {
//        //  ¡ALERTA! Si hay un error, la conexión falló.
//        console.error(" ERROR EN LA PRUEBA DE CONEXIÓN A FIREBASE. Revisa tu firebaseConfig.js y reglas de Firestore.", e);
//      }
//    };
//
//    // Llama a la función de prueba
//    testFirestoreConnection();
//    
//  }, []); // El array vacío asegura que esto se ejecute solo una vez al inicio

  // 3. Renderiza tu AppNavigator (como antes)
  return (
    <AppNavigator />
  );
}

