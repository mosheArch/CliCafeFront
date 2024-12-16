import { getCategories, getProducts, getCart, addToCart, updateCartItem, removeCartItem, createOrderFromCart, processPayment, Category } from './api';
import { getProductDetails } from './api';
import { procesarPago as procesarPagoApi } from './api';

interface Product {
  id: number;
  nombre: string;
  precio: string;
  tipo: string;
  peso: number;
  descripcion?: string;
  imagen?: string;
}

interface CommandOutput {
  output: string[];
  newPath: string;
  showPopup?: boolean;
  coffeeInfo?: {
    name: string;
    price: string;
    description: string;
    imageUrl?: string;
  };
  shouldLogout?: boolean;
}

interface CartItem {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precio: string;
  };
  cantidad: number;
}

let cart: CartItem[] = [];

export async function processCommand(command: string, currentPath: string, username?: string): Promise<CommandOutput> {
  const args = command.split(' ');
  const cmd = args.shift()?.toLowerCase();

  switch (cmd) {
    case 'ls':
      if (args[0] === 'categorias') {
        try {
          const categories: Category[] = await getCategories();
          return { output: ['Categorías disponibles:', ...categories.map(cat => `${cat.id}. ${cat.nombre}: ${cat.descripcion}`)], newPath: currentPath };
        } catch (error) {
          return { output: ['Error al obtener categorías'], newPath: currentPath };
        }
      }
      if (args[0] === 'productos') {
        const categoria = args.find(arg => arg.startsWith('-categoria='))?.split('=')[1];
        const tipo = args.find(arg => arg.startsWith('-tipo='))?.split('=')[1] as 'GRANO' | 'MOLIDO' | undefined;
        const peso = args.find(arg => arg.startsWith('-peso='))?.split('=')[1];
        try {
          const products: Product[] = await getProducts({
            categoria: categoria ? parseInt(categoria) : undefined,
            tipo,
            peso: peso ? parseInt(peso) as 250 | 500 | 1000 : undefined
          });
          return {
            output: [
              'Productos disponibles:',
              ...products.map(prod => `ID: ${prod.id} - ${prod.nombre} - $${prod.precio} (${prod.tipo}, ${prod.peso}g)`)
            ],
            newPath: currentPath
          };
        } catch (error) {
          return { output: ['Error al obtener productos'], newPath: currentPath };
        }
      }
      return { output: ['Uso: ls categorias | ls productos [-categoria=ID] [-tipo=GRANO|MOLIDO] [-peso=250|500|1000]'], newPath: currentPath };

    case 'ver':
      if (args[0] === 'carrito') {
        try {
          cart = await getCart();
          if (cart.length === 0) {
            return { output: ['El carrito está vacío'], newPath: currentPath };
          }
          const cartItems = cart.map(item =>
            `ID: ${item.id} - ${item.producto.nombre} x${item.cantidad} - $${(parseFloat(item.producto.precio) * item.cantidad).toFixed(2)}`
          );
          const total = cart.reduce((sum, item) => sum + parseFloat(item.producto.precio) * item.cantidad, 0);
          return {
            output: [
              'Contenido del carrito:',
              ...cartItems,
              `Total: $${total.toFixed(2)}`
            ],
            newPath: currentPath
          };
        } catch (error) {
          return { output: ['Error al obtener el carrito'], newPath: currentPath };
        }
      }
      return { output: ['Uso: ver carrito'], newPath: currentPath };

    case 'agregar':
      if (args[0] === 'carrito') {
        const productId = args.find(arg => arg.startsWith('-producto='))?.split('=')[1];
        const quantity = args.find(arg => arg.startsWith('-cantidad='))?.split('=')[1];
        if (productId && quantity) {
          const productIdNum = parseInt(productId);
          const quantityNum = parseInt(quantity);
          if (!isNaN(productIdNum) && !isNaN(quantityNum)) {
            try {
              await addToCart(productIdNum, quantityNum);
              return { output: [`Producto agregado al carrito: ID ${productIdNum}, Cantidad ${quantityNum}`], newPath: currentPath };
            } catch (error) {
              return { output: ['Error al agregar al carrito'], newPath: currentPath };
            }
          }
        }
      }
      return { output: ['Uso: agregar carrito -producto=ID -cantidad=N'], newPath: currentPath };

    case 'actualizar':
      if (args[0] === 'carrito') {
        const itemId = args.find(arg => arg.startsWith('-item='))?.split('=')[1];
        const quantity = args.find(arg => arg.startsWith('-cantidad='))?.split('=')[1];
        if (itemId && quantity) {
          const itemIdNum = parseInt(itemId);
          const quantityNum = parseInt(quantity);
          if (!isNaN(itemIdNum) && !isNaN(quantityNum)) {
            try {
              await updateCartItem(itemIdNum, quantityNum);
              return { output: [`Item del carrito actualizado: ID ${itemIdNum}, Nueva cantidad ${quantityNum}`], newPath: currentPath };
            } catch (error) {
              return { output: ['Error al actualizar el carrito'], newPath: currentPath };
            }
          }
        }
      }
      return { output: ['Uso: actualizar carrito -item=ID -cantidad=N'], newPath: currentPath };

    case 'eliminar':
      if (args[0] === 'carrito') {
        const itemId = args.find(arg => arg.startsWith('-item='))?.split('=')[1];
        if (itemId) {
          const itemIdNum = parseInt(itemId);
          if (!isNaN(itemIdNum)) {
            try {
              await removeCartItem(itemIdNum);
              return { output: [`Item removido del carrito: ID ${itemIdNum}`], newPath: currentPath };
            } catch (error) {
              return { output: ['Error al remover item del carrito'], newPath: currentPath };
            }
          }
        }
      }
      return { output: ['Uso: eliminar carrito -item=ID'], newPath: currentPath };

    case 'pagar':
      try {
        const shippingAddress = {
          calle: args.find(arg => arg.startsWith('-calle='))?.split('=')[1]?.replace(/"/g, '') || '',
          numero_exterior: args.find(arg => arg.startsWith('-numero_exterior='))?.split('=')[1]?.replace(/"/g, '') || '',
          numero_interior: args.find(arg => arg.startsWith('-numero_interior='))?.split('=')[1]?.replace(/"/g, ''),
          colonia: args.find(arg => arg.startsWith('-colonia='))?.split('=')[1]?.replace(/"/g, '') || '',
          ciudad: args.find(arg => arg.startsWith('-ciudad='))?.split('=')[1]?.replace(/"/g, '') || '',
          estado: args.find(arg => arg.startsWith('-estado='))?.split('=')[1]?.replace(/"/g, '') || '',
          codigo_postal: args.find(arg => arg.startsWith('-codigo_postal='))?.split('=')[1]?.replace(/"/g, '') || '',
        };

        if (!shippingAddress.calle || !shippingAddress.numero_exterior || !shippingAddress.colonia ||
            !shippingAddress.ciudad || !shippingAddress.estado || !shippingAddress.codigo_postal) {
          return { output: ['Error: Todos los campos de dirección son obligatorios, excepto numero_interior.'], newPath: currentPath };
        }

        const order = await createOrderFromCart(shippingAddress);
        if (!order || !order.id) {
          return { output: ['Error: No se pudo crear la orden. Asegúrese de que el carrito no esté vacío.'], newPath: currentPath };
        }

        const payment = await processPayment(order.id);
        return {
          output: [
            'Orden creada exitosamente',
            `ID de la orden: ${order.id}`,
            `Total: $${order.total}`,
            'Para completar el pago, use el siguiente enlace:',
            payment.init_point
          ],
          newPath: currentPath
        };
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        if (error instanceof Error) {
          return { output: [`Error al procesar el pago: ${error.message}`], newPath: currentPath };
        } else {
          return { output: ['Error al procesar el pago. Por favor, intente nuevamente.'], newPath: currentPath };
        }
      }

    case 'vi':
      const productId = parseInt(args[0]);
      if (!isNaN(productId)) {
        try {
          console.log(`Attempting to fetch details for product ID: ${productId}`);
          const product = await getProductDetails(productId);
          return {
            output: [`Mostrando detalles del producto: ${product.nombre}`],
            newPath: currentPath,
            showPopup: true,
            coffeeInfo: {
              name: product.nombre,
              price: `$${product.precio}`,
              description: product.descripcion || 'No hay descripción disponible.',
              imageUrl: product.imagen
            }
          };
        } catch (error) {
          console.error('Error fetching product details:', error);
          if (error instanceof Error) {
            return { output: [`Error al obtener los detalles del producto: ${error.message}`], newPath: currentPath };
          } else {
            return { output: ['Error al obtener los detalles del producto. Por favor, intente nuevamente.'], newPath: currentPath };
          }
        }
      }
      return { output: ['Uso: vi ID_PRODUCTO'], newPath: currentPath };

    case 'help':
      return {
        output: [
          'Comandos disponibles:',
          'ls categorias: Listar categorías de productos',
          'ls productos [-categoria=ID] [-tipo=GRANO|MOLIDO] [-peso=250|500|1000]: Listar productos',
          'ver carrito: Ver contenido del carrito',
          'agregar carrito -producto=ID -cantidad=N: Agregar producto al carrito',
          'actualizar carrito -item=ID -cantidad=N: Actualizar cantidad de un item en el carrito',
          'eliminar carrito -item=ID: Remover item del carrito',
          'pagar -calle="Calle" -numero_exterior="123" [-numero_interior="4B"] -colonia="Colonia" -ciudad="Ciudad" -estado="Estado" -codigo_postal="12345": Procesar orden y pago',
          'vi ID_PRODUCTO: Ver detalles de un producto',
          'exit: Salir de la sesión',
          'help: Mostrar esta lista de comandos'
        ],
        newPath: currentPath
      };

    case 'exit':
      return { output: [`Saliendo de ${username || 'guest'}@shop Terminal...`], newPath: currentPath, shouldLogout: true };

    default:
      return { output: [`Error: Comando no reconocido: ${cmd}. Escribe "help" para ver los comandos disponibles.`], newPath: currentPath };
  }
}

export const procesarPago = async (orderId: number): Promise<{ init_point: string }> => {
  return procesarPagoApi(orderId);
};

