// src/navigation/AppNavigator.js

import React, { useState, useEffect } from 'react';
// 1. Core y Stack imports
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';

// 2. Firebase imports
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from '../config/firebaseConfig'; // Importa la instancia de Auth

// 3. Importa todas las pantallas
import LoginScreen from '../screens/Auth/LoginScreen'; 
import MenuScreen from '../screens/Main/MenuScreen'; 
import ClientsScreen from '../screens/Clients/ClientsScreen';
import ClientFormScreen from '../screens/Clients/ClientFormScreen';
import ProductsScreen from '../screens/Products/ProductsScreen';
import ProductFormScreen from '../screens/Products/ProductFormScreen';
import NewInvoiceScreen from '../screens/Invoicing/NewInvoiceScreen';
import InvoicesScreen from '../screens/Invoicing/InvoicesScreen';
import InvoiceDetailScreen from '../screens/Invoicing/InvoiceDetailScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Función que maneja el cambio de estado de autenticación (Login/Logout)
  function onAuthStateChange(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    // Suscribirse al estado de autenticación de Firebase
    const subscriber = onAuthStateChanged(auth, onAuthStateChange);
    return subscriber; // Función de limpieza al desmontar
  }, []);

  if (initializing) {
    // Pantalla de carga mientras se verifica el token de Firebase
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando sesión de Firebase...</Text>
      </View>
    );
  }

  // RETORNA DIRECTAMENTE EL STACK (sin NavigationContainer para evitar el error de Expo Router)
  return (
    <> 
      {/* El Fragmento <> </> actúa como contenedor raíz */}
      {user ? (
        // Stack Principal (Usuario Logueado)
        <Stack.Navigator>
          
          <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Menú Principal 🏠' }} />
          
          {/* RUTAS DE CLIENTES */}
          <Stack.Screen name="Clients" component={ClientsScreen} options={{ title: 'Gestión de Clientes' }} />
          <Stack.Screen name="ClientForm" component={ClientFormScreen} options={{ title: 'Ficha de Cliente' }} />
          
          {/* RUTAS DE PRODUCTOS */}
          <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Gestión de Productos' }} />
          <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Ficha de Producto' }} />
          
          {/* RUTAS DE FACTURACIÓN */}
          <Stack.Screen name="NewInvoice" component={NewInvoiceScreen} options={{ title: 'Nueva Factura' }} />
          {/* 🆕 RUTAS DE HISTORIAL */}
          <Stack.Screen 
            name="Invoices" 
            component={InvoicesScreen} 
            options={{ title: 'Historial de Facturas' }} 
          />
          <Stack.Screen 
            name="InvoiceDetail" 
            component={InvoiceDetailScreen} 
            options={({ route }) => ({ title: `Detalle Factura #${route.params.invoiceNumber}` })}
          />

        </Stack.Navigator>
      ) : (
        // Stack de Autenticación (Usuario No Logueado)
        <Stack.Navigator>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </>
  );
};

export default AppNavigator;