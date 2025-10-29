// src/screens/Invoicing/NewInvoiceScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { collection, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

// Estado inicial para un nuevo ítem de línea de factura
const initialLineItem = {
    productId: null,
    name: '',
    price: 0,
    quantity: 1,
    subtotal: 0,
    stock: 0, // Para validación
};

const COLORS = {
    primary: '#007AFF', // Azul
    secondary: '#FF9500', // Naranja para Totales
    success: '#34C759', // Verde para Añadir Producto
    card: '#FFFFFF',
    background: '#F9F9F9',
    textPrimary: '#1C1C1E',
    textSecondary: '#636366',
    danger: '#FF3B30',
};
const RADIUS = 12;
const PADDING = 15;

const NewInvoiceScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [lineItems, setLineItems] = useState([]); // Los productos que se van a facturar
    const [loading, setLoading] = useState(false);

    // --- CÁLCULOS PRINCIPALES ---
    const subTotal = lineItems.reduce((acc, item) => acc + item.subtotal, 0);
    const taxRate = 0.19; // Ejemplo de IVA del 19%
    const taxes = subTotal * taxRate;
    const total = subTotal + taxes;

    // --- FUNCIONES DE CARGA DE DATOS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // Cargar Clientes
            const clientSnapshot = await getDocs(collection(db, 'clients'));
            const clientList = clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClients(clientList);

            // Cargar Productos
            const productSnapshot = await getDocs(collection(db, 'products'));
            const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productList);

        } catch (error) {
            console.error("Error al cargar datos:", error);
            Alert.alert("Error", "No se pudieron cargar los datos de clientes y productos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchData();
        }
    }, [isFocused]);

    // --- MANEJO DE ÍTEMS DE FACTURA ---

    // 1. Añadir un producto al carrito
    const handleAddProduct = (product) => {
        // Validación de stock
        if (product.stock <= 0) {
            Alert.alert("Stock Agotado", `El producto ${product.name} no tiene stock disponible.`);
            return;
        }

        // Si el producto ya está en el carrito, aumentar cantidad
        const existingItem = lineItems.find(item => item.productId === product.id);
        if (existingItem) {
            handleUpdateQuantity(existingItem.productId, existingItem.quantity + 1);
            return;
        }

        // Añadir nuevo ítem
        const newItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            subtotal: product.price * 1,
            stock: product.stock,
        };
        setLineItems([...lineItems, newItem]);
    };

    // 2. Actualizar cantidad de un ítem
    const handleUpdateQuantity = (productId, newQuantity) => {
        const itemToUpdate = lineItems.find(item => item.productId === productId);
        if (!itemToUpdate) return;
        
        const newQty = parseInt(newQuantity || '0', 10);
        
        if (newQty <= 0) {
            // Si la cantidad es 0 o menos, preguntar si desea eliminar
            handleRemoveItem(productId);
            return;
        }
        
        // Validación de stock
        if (newQty > itemToUpdate.stock) {
            Alert.alert("Error de Stock", `Solo quedan ${itemToUpdate.stock} unidades de este producto.`);
            return;
        }

        setLineItems(currentItems => 
            currentItems.map(item => 
                item.productId === productId
                    ? { ...item, quantity: newQty, subtotal: item.price * newQty }
                    : item
            )
        );
    };

    // 3. Eliminar un ítem
    const handleRemoveItem = (productId) => {
        setLineItems(currentItems => currentItems.filter(item => item.productId !== productId));
    };


    // --- FUNCIÓN DE GUARDAR FACTURA (CREATE) ---
    const handleGenerateInvoice = async () => {
        if (!selectedClient) {
            Alert.alert("Error", "Debes seleccionar un cliente.");
            return;
        }
        if (lineItems.length === 0) {
            Alert.alert("Error", "Debes añadir al menos un producto.");
            return;
        }

        setLoading(true);
        try {
            // 1. Construir el objeto de la factura
            const invoiceData = {
                client: {
                    id: selectedClient.id,
                    name: selectedClient.name,
                    identification: selectedClient.identification,
                },
                items: lineItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                })),
                date: new Date().toISOString(),
                salespersonId: auth.currentUser.uid, // ID del vendedor logueado
                salespersonEmail: auth.currentUser.email,
                subTotal: subTotal,
                taxes: taxes,
                total: total,
                status: 'Emitida', // Podría ser 'Pagada', 'Pendiente', etc.
            };

            // 2. Guardar la factura en la colección 'invoices'
            await addDoc(collection(db, 'invoices'), invoiceData);
            Alert.alert("Éxito", "Factura generada y guardada correctamente.");

            // 3. Actualizar el stock de los productos (descontar del inventario)
            const stockUpdates = lineItems.map(item => {
                const productRef = doc(db, 'products', item.productId);
                // Usar 'increment' para descontar la cantidad de forma segura
                return updateDoc(productRef, {
                    stock: increment(-item.quantity)
                });
            });
            await Promise.all(stockUpdates); // Esperar a que todos los stocks se actualicen

            // 4. Limpiar el estado para una nueva factura
            setSelectedClient(null);
            setLineItems([]);
            fetchData(); // Volver a cargar los productos con el nuevo stock

        } catch (error) {
            console.error("Error al generar factura:", error);
            Alert.alert("Error", "Ocurrió un error al generar la factura.");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERS ---

    // Render de cada ítem en el carrito
    const renderLineItem = ({ item }) => (
        <View style={styles.lineItemRow}>
            <View style={styles.lineItemDetail}>
                <Text style={styles.lineItemName}>{item.name}</Text>
                <Text style={styles.lineItemPrice}>${item.price.toFixed(2)} c/u</Text>
            </View>
            <View style={styles.lineItemQuantity}>
                <TextInput
                    style={styles.quantityInput}
                    value={String(item.quantity)}
                    onChangeText={(text) => handleUpdateQuantity(item.productId, text)}
                    keyboardType="numeric"
                />
            </View>
            <Text style={styles.lineItemSubtotal}>${item.subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
            <TouchableOpacity 
                onPress={() => handleRemoveItem(item.productId)}
                style={{ padding: 5, marginLeft: 10 }}
            >
                <Ionicons name="close-circle-outline" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    // Render del selector de cliente
    const ClientPicker = () => (
        <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Cliente:</Text>
            {selectedClient ? (
                <View style={styles.selectedClientContainer}>
                    <Text style={styles.selectedClientName}>{selectedClient.name}</Text>
                    <TouchableOpacity onPress={() => setSelectedClient(null)} style={styles.changeButton}>
                        <Text style={styles.changeButtonText}>Cambiar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={clients}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.clientButton} onPress={() => setSelectedClient(item)}>
                            <Text style={styles.clientButtonText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ padding: 10 }}>No hay clientes. Crea uno primero.</Text>}
                />
            )}
        </View>
    );
    
    // Render del selector de producto (para añadir al carrito)
    const ProductPicker = () => (
        <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Añadir Producto:</Text>
            <FlatList
                data={products}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={[styles.productButton, item.stock <= 0 && styles.productButtonDisabled]} 
                        onPress={() => handleAddProduct(item)}
                        disabled={item.stock <= 0}
                    >
                        <Text style={styles.productButtonText}>{item.name} (${item.price})</Text>
                        {item.stock <= 0 && <Text style={styles.stockLabel}>AGOTADO</Text>}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={{ padding: 10 }}>No hay productos. Crea uno primero.</Text>}
            />
        </View>
    );


    if (loading && !selectedClient) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContent}>
                <ClientPicker />
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Productos a Facturar</Text>
                    {selectedClient && <ProductPicker />} 
                    
                    {lineItems.length > 0 ? (
                        <FlatList
                            data={lineItems}
                            renderItem={renderLineItem}
                            keyExtractor={item => item.productId}
                            scrollEnabled={false}
                        />
                    ) : (
                        <Text style={styles.emptyItemsText}>Añade productos para comenzar.</Text>
                    )}
                </View>

                {/* --- SECCIÓN DE TOTALES --- */}
                <View style={styles.totalsContainer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>${subTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>IVA ({taxRate * 100}%)</Text>
                        <Text style={styles.totalValue}>${taxes.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotalRow]}>
                        <Text style={styles.grandTotalLabel}>TOTAL A PAGAR</Text>
                        <Text style={styles.grandTotalValue}>${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                    </View>
                </View>

            </ScrollView>
            
            {/* BOTÓN DE GENERAR FACTURA */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.generateButton}
                    onPress={handleGenerateInvoice}
                    disabled={lineItems.length === 0 || !selectedClient || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.generateButtonText}>Generar Factura (${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")})</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: PADDING },
    section: { 
        marginTop: 15, 
        padding: PADDING, 
        backgroundColor: COLORS.card, 
        borderRadius: RADIUS, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowRadius: 5, 
        elevation: 2 
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },

    // Cliente Picker
    pickerContainer: { marginBottom: 15 },
    pickerLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 5 },
    selectedClientContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#E6F0FF', // Fondo azul claro
        padding: 10, 
        borderRadius: 8, 
        justifyContent: 'space-between' 
    },
    selectedClientName: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
    changeButton: { padding: 5 },
    changeButtonText: { color: COLORS.primary, fontWeight: 'bold' },
    clientButton: { 
        paddingVertical: 8, 
        paddingHorizontal: 15, 
        backgroundColor: COLORS.card, 
        borderWidth: 1, 
        borderColor: COLORS.primary, 
        borderRadius: 20, 
        marginHorizontal: 5 
    },
    clientButtonText: { color: COLORS.primary, fontWeight: '600' },
    
    // Producto Picker
    productButton: { 
        padding: 10, 
        backgroundColor: COLORS.success, // Verde para añadir producto
        borderRadius: 8, 
        marginHorizontal: 5, 
        alignItems: 'center', 
        minWidth: 120 
    },
    productButtonDisabled: { backgroundColor: '#C7C7CC' },
    productButtonText: { color: COLORS.card, fontWeight: 'bold', fontSize: 14 },
    stockLabel: { color: COLORS.card, fontSize: 12, fontWeight: 'bold' },

    // Line Items
    lineItemRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#F0F0F0' 
    },
    lineItemDetail: { flex: 3 },
    lineItemName: { fontWeight: '600', color: COLORS.textPrimary },
    lineItemPrice: { fontSize: 12, color: COLORS.textSecondary },
    lineItemQuantity: { flex: 1, minWidth: 50, alignItems: 'center' },
    quantityInput: { 
        borderWidth: 1, 
        borderColor: '#D1D1D6', // Borde suave
        borderRadius: 5, 
        padding: 5, 
        textAlign: 'center',
        width: '100%',
        backgroundColor: COLORS.card,
    },
    lineItemSubtotal: { flex: 2, textAlign: 'right', fontWeight: 'bold', color: COLORS.textPrimary },
    emptyItemsText: { textAlign: 'center', color: COLORS.textSecondary, opacity: 0.7, paddingVertical: 20 },

    // Totales
    totalsContainer: { 
        marginTop: 20, 
        padding: 15, 
        backgroundColor: COLORS.card, 
        borderRadius: RADIUS, 
        borderWidth: 1, 
        borderColor: '#E5E5EA' 
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    totalLabel: { fontSize: 16, color: COLORS.textPrimary },
    totalValue: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
    grandTotalRow: { borderTopWidth: 1, borderTopColor: '#ccc', marginTop: 10, paddingTop: 10 },
    grandTotalLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
    grandTotalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
    
    // Footer y Botón
    footer: { borderTopWidth: 1, borderTopColor: '#ccc', padding: 10, backgroundColor: COLORS.card },
    generateButton: {
        backgroundColor: COLORS.secondary, // Naranja para la acción principal
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    generateButtonText: {
        color: COLORS.card,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default NewInvoiceScreen;