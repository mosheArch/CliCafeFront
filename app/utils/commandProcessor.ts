import { getCategories, getProducts, getCart, addToCart, updateCartItem, removeCartItem, createOrderFromCart, processPayment, Category } from './api';
import { getProductDetails } from './api';

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
        const categoria = args.indexOf('categoria') !== -1 ? args[args.indexOf('categoria') + 1] : undefined;
        const tipo = args.indexOf('tipo') !== -1 ? args[args.indexOf('tipo') + 1] as 'GRANO' | 'MOLIDO' : undefined;
        const peso = args.indexOf('peso') !== -1 ? args[args.indexOf('peso') + 1] : undefined;
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
      return { output: ['Uso: ls categorias | ls productos [categoria ID] [tipo GRANO|MOLIDO] [peso 250|500|1000]'], newPath: currentPath };

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
      if (args[0] === 'carrito' && args[1] === 'producto' && args[3] === 'cantidad') {
        const productId = parseInt(args[2]);
        const quantity = parseInt(args[4]);
        if (!isNaN(productId) && !isNaN(quantity)) {
          try {
            await addToCart(productId, quantity);
            return { output: [`Producto agregado al carrito: ID ${productId}, Cantidad ${quantity}`], newPath: currentPath };
          } catch (error) {
            return { output: ['Error al agregar al carrito'], newPath: currentPath };
          }
        }
      }
      return { output: ['Uso: agregar carrito producto ID cantidad N'], newPath: currentPath };

    case 'actualizar':
      if (args[0] === 'carrito' && args[1] === 'item' && args[3] === 'cantidad') {
        const itemId = parseInt(args[2]);
        const quantity = parseInt(args[4]);
        if (!isNaN(itemId) && !isNaN(quantity)) {
          try {
            await updateCartItem(itemId, quantity);
            return { output: [`Item del carrito actualizado: ID ${itemId}, Nueva cantidad ${quantity}`], newPath: currentPath };
          } catch (error) {
            return { output: ['Error al actualizar el carrito'], newPath: currentPath };
          }
        }
      }
      return { output: ['Uso: actualizar carrito item ID cantidad N'], newPath: currentPath };

    case 'eliminar':
      if (args[0] === 'carrito' && args[1] === 'item') {
        const itemId = parseInt(args[2]);
        if (!isNaN(itemId)) {
          try {
            await removeCartItem(itemId);
            return { output: [`Item removido del carrito: ID ${itemId}`], newPath: currentPath };
          } catch (error) {
            return { output: ['Error al remover item del carrito'], newPath: currentPath };
          }
        }
      }
      return { output: ['Uso: eliminar carrito item ID'], newPath: currentPath };

    case 'pagar':
      try {
        const shippingAddress = {
          calle: args[args.indexOf('calle') + 1].replace(/"/g, ''),
          numero_exterior: args[args.indexOf('numero_exterior') + 1].replace(/"/g, ''),
          numero_interior: args.indexOf('numero_interior') !== -1 ? args[args.indexOf('numero_interior') + 1].replace(/"/g, '') : undefined,
          colonia: args[args.indexOf('colonia') + 1].replace(/"/g, ''),
          ciudad: args[args.indexOf('ciudad') + 1].replace(/"/g, ''),
          estado: args[args.indexOf('estado') + 1].replace(/"/g, ''),
          codigo_postal: args[args.indexOf('codigo_postal') + 1].replace(/"/g, ''),
        };
        const order = await createOrderFromCart(shippingAddress);
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
        return { output: ['Error al procesar el pago. Asegúrese de que el carrito no esté vacío y que todos los datos de envío sean correctos.'], newPath: currentPath };
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
          'ls productos [categoria ID] [tipo GRANO|MOLIDO] [peso 250|500|1000]: Listar productos',
          'ver carrito: Ver contenido del carrito',
          'agregar carrito producto ID cantidad N: Agregar producto al carrito',
          'actualizar carrito item ID cantidad N: Actualizar cantidad de un item en el carrito',
          'eliminar carrito item ID: Remover item del carrito',
          'pagar calle "Calle" numero_exterior "123" [numero_interior "4B"] colonia "Colonia" ciudad "Ciudad" estado "Estado" codigo_postal "12345": Procesar orden y pago',
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

