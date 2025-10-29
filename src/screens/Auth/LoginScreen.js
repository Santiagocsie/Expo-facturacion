// src/screens/Auth/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';

// Importa la función de login de Firebase
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../../config/firebaseConfig'; // Asegúrate de que la ruta sea correcta

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa correo y contraseña.');
      return;
    }

    try {
      // 1. Llama a la función de Firebase para iniciar sesión
      await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Si es exitoso, Firebase se encargará de cambiar el estado de autenticación.
      //    El AppNavigator detectará el cambio y navegará automáticamente.
      //    Por ahora, solo mostraremos un mensaje de éxito.
      console.log('Usuario autenticado con éxito!'); 
      // NOTA: No necesitamos 'navigation.navigate('Menu')' aquí 
      // si usamos un componente condicional en AppNavigator.js

    } catch (error) {
      // 3. Manejo de errores de autenticación
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Formato de correo inválido.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Credenciales incorrectas.';
      }
      Alert.alert('Error de Login', errorMessage);
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* COMENTAMOS ESTO TEMPORALMENTE: */}
    {/* <Image 
      source={require('../../../assets/logo_facturacion.png')} 
      style={styles.logo}
    />
    */}
        <Text style={styles.title}>Sistema de Facturación</Text>
        <Text style={styles.subtitle}>Gestiona tu negocio fácilmente</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Usuario (Correo Electrónico)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>💡 Usuario: admin@ejemplo.com| Contraseña: 123456</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003366', // Azul profundo, basado en tu ejemplo
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
    resizeMode: 'contain',
    // Asegúrate de crear una imagen simple y ponerla en assets/
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: '100%',
    backgroundColor: '#0066cc', // Azul más claro para el botón
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  hintContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fffbe6',
    borderRadius: 5,
  },
  hintText: {
    fontSize: 12,
    color: '#856404',
  }
});

export default LoginScreen;