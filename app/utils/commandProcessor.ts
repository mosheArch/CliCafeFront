import { fileSystem, findFile, listDirectory, File } from './fileSystem';

interface CommandOutput {
  output: string[];
  newPath: string;
  showPopup?: boolean;
  coffeeInfo?: {
    name: string;
    price: string;
    description: string;
  };
}

interface User {
  email: string;
  name: string;
  phone?: string;
}

interface CartItem {
  product: string;
  form?: string;
  weight?: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  type: 'coffee' | 'accessory';
  price: number;
  description: string;
  form?: string;
  origin?: string;
  roast?: string;
}

let currentUser: User | null = null;
let cart: CartItem[] = [];
let orders: any[] = [];

const products: Product[] = [
  { id: 'COL001', name: 'Colombian Supreme', type: 'coffee', price: 15.99, description: 'Rich and full-bodied', form: 'Whole Bean', origin: 'Colombia', roast: 'Medium' },
  { id: 'ETH001', name: 'Ethiopian Yirgacheffe', type: 'coffee', price: 17.99, description: 'Floral and citrusy', form: 'Ground', origin: 'Ethiopia', roast: 'Light' },
  { id: 'BRA001', name: 'Brazilian Santos', type: 'coffee', price: 14.99, description: 'Nutty and sweet', form: 'Drip Bags', origin: 'Brazil', roast: 'Medium' },
  { id: 'GRI001', name: 'Manual Grinder', type: 'accessory', price: 29.99, description: 'Adjustable ceramic burr grinder' },
  { id: 'PRE001', name: 'French Press', type: 'accessory', price: 24.99, description: 'Classic glass French press' },
  { id: 'CUP001', name: 'Ceramic Mug Set', type: 'accessory', price: 19.99, description: 'Set of 4 ceramic mugs' },
];

export function processCommand(command: string, currentPath: string): CommandOutput {
  const [cmd, ...args] = command.split(' ');
  const pathArray = currentPath === '~' ? [] : currentPath.split('/').filter(Boolean);

  switch (cmd.toLowerCase()) {
    // 1. Account Management
    case 'login':
      const email = args.find(arg => arg.startsWith('--user'))?.split('=')[1];
      const password = args.find(arg => arg.startsWith('--password'))?.split('=')[1];
      if (email && password) {
        currentUser = { email, name: 'User' }; // In a real app, validate credentials
        return { output: [`Logged in as ${email}`], newPath: currentPath };
      }
      return { output: ['Invalid login command. Use: login --user=email --password=pass'], newPath: currentPath };

    case 'logout':
      currentUser = null;
      return { output: ['Logged out successfully'], newPath: currentPath };

    case 'register':
      const newEmail = args.find(arg => arg.startsWith('--user'))?.split('=')[1];
      const newPassword = args.find(arg => arg.startsWith('--password'))?.split('=')[1];
      const name = args.find(arg => arg.startsWith('--name'))?.split('=')[1];
      if (newEmail && newPassword && name) {
        currentUser = { email: newEmail, name };
        return { output: [`Registered and logged in as ${newEmail}`], newPath: currentPath };
      }
      return { output: ['Invalid register command. Use: register --user=email --password=pass --name="Full Name"'], newPath: currentPath };

    case 'update-account':
      if (!currentUser) return { output: ['Please login first'], newPath: currentPath };
      const newEmail2 = args.find(arg => arg.startsWith('--email'))?.split('=')[1];
      const phone = args.find(arg => arg.startsWith('--phone'))?.split('=')[1];
      if (newEmail2) currentUser.email = newEmail2;
      if (phone) currentUser.phone = phone;
      return { output: ['Account updated successfully'], newPath: currentPath };

    case 'passwd':
      return { output: ['Password change functionality not implemented'], newPath: currentPath };

    case 'whoami':
      if (currentUser) {
        return { output: [`Logged in as ${currentUser.email}`], newPath: currentPath };
      }
      return { output: ['Not logged in'], newPath: currentPath };

    // 2. Product Navigation and Search
    case 'ls':
      if (args[0] === 'products') {
        return { output: ['List of products:', ...products.map(p => `${p.id}. ${p.name} - $${p.price}`)], newPath: currentPath };
      }
      if (args[0] === 'coffee') {
        const form = args.find(arg => arg.startsWith('--form'))?.split('=')[1];
        const coffeeProducts = products.filter(p => p.type === 'coffee' && (!form || p.form === form));
        return { output: [`List of ${form || ''} coffee:`, ...coffeeProducts.map(p => `${p.id}. ${p.name} - $${p.price}`)], newPath: currentPath };
      }
      if (args[0] === 'accessories') {
        const accessories = products.filter(p => p.type === 'accessory');
        return { output: ['List of accessories:', ...accessories.map(p => `${p.id}. ${p.name} - $${p.price}`)], newPath: currentPath };
      }
      return { output: listDirectory(pathArray), newPath: currentPath };

    case 'find':
      if (args[0] === 'coffee') {
        const type = args.find(arg => arg.startsWith('--type'))?.split('=')[1];
        const origin = args.find(arg => arg.startsWith('--origin'))?.split('=')[1];
        const roast = args.find(arg => arg.startsWith('--roast'))?.split('=')[1];
        const filteredCoffee = products.filter(p =>
          p.type === 'coffee' &&
          (!type || p.form === type) &&
          (!origin || p.origin === origin) &&
          (!roast || p.roast === roast)
        );
        return { output: ['Found coffee:', ...filteredCoffee.map(p => `${p.id}. ${p.name} - $${p.price}`)], newPath: currentPath };
      }
      return { output: ['Invalid find command'], newPath: currentPath };

    case 'cat':
      if (args[0] === 'product') {
        const productId = args[1];
        const product = products.find(p => p.id === productId);
        if (product) {
          return {
            output: [
              `Details for ${product.name}:`,
              `ID: ${product.id}`,
              `Type: ${product.type}`,
              `Price: $${product.price}`,
              `Description: ${product.description}`,
              ...(product.form ? [`Form: ${product.form}`] : []),
              ...(product.origin ? [`Origin: ${product.origin}`] : []),
              ...(product.roast ? [`Roast: ${product.roast}`] : []),
            ],
            newPath: currentPath,
            showPopup: true,
            coffeeInfo: {
              name: product.name,
              price: `$${product.price}`,
              description: product.description
            }
          };
        }
        return { output: [`Product ${productId} not found`], newPath: currentPath };
      }
      // ... (other 'cat' commands)

    // 3. Cart Management
    case 'add-to-cart':
      const productId = args.find(arg => arg.startsWith('--product'))?.split('=')[1];
      const form = args.find(arg => arg.startsWith('--form'))?.split('=')[1];
      const weight = args.find(arg => arg.startsWith('--weight'))?.split('=')[1];
      const quantity = parseInt(args.find(arg => arg.startsWith('--quantity'))?.split('=')[1] || '1');
      const product = products.find(p => p.id === productId);
      if (product) {
        cart.push({ product: product.name, form, weight, quantity });
        return { output: [`Added ${quantity} ${product.name} to cart`], newPath: currentPath };
      }
      return { output: ['Invalid add-to-cart command or product not found'], newPath: currentPath };

    case 'cat':
      if (args[0] === 'cart') {
        if (cart.length === 0) return { output: ['Your cart is empty'], newPath: currentPath };
        return {
          output: [
            'Your cart:',
            ...cart.map(item => `${item.quantity}x ${item.product}${item.form ? ` (${item.form})` : ''}${item.weight ? ` - ${item.weight}` : ''}`),
            `Total: $${calculateTotal()}`
          ],
          newPath: currentPath
        };
      }
      // ... (other 'cat' commands)

    case 'rm-from-cart':
      const productToRemove = args.join(' ');
      const initialLength = cart.length;
      cart = cart.filter(item => item.product !== productToRemove);
      if (cart.length < initialLength) {
        return { output: [`Removed ${productToRemove} from cart`], newPath: currentPath };
      }
      return { output: [`${productToRemove} not found in cart`], newPath: currentPath };

    case 'update-cart':
      const productToUpdate = args[0];
      const newQuantity = parseInt(args.find(arg => arg.startsWith('--quantity'))?.split('=')[1] || '0');
      const itemIndex = cart.findIndex(item => item.product === productToUpdate);
      if (itemIndex !== -1 && newQuantity > 0) {
        cart[itemIndex].quantity = newQuantity;
        return { output: [`Updated ${productToUpdate} quantity to ${newQuantity}`], newPath: currentPath };
      }
      return { output: ['Invalid update-cart command or product not found'], newPath: currentPath };

    case 'clear':
      if (args[0] === 'cart') {
        cart = [];
        return { output: ['Cart cleared'], newPath: currentPath };
      }
      return { output: ['Invalid clear command'], newPath: currentPath };

    // 4. Checkout Process
    case 'checkout':
      if (cart.length === 0) return { output: ['Your cart is empty'], newPath: currentPath };
      return { output: ['Proceeding to checkout...', 'Use set-payment, set-shipping, and confirm-order to complete your purchase.'], newPath: currentPath };

    case 'set-payment':
      const method = args.find(arg => arg.startsWith('--method'))?.split('=')[1];
      if (method) {
        return { output: [`Payment method set to ${method}`], newPath: currentPath };
      }
      return { output: ['Invalid set-payment command'], newPath: currentPath };

    case 'apply-coupon':
      return { output: [`Coupon ${args[0]} applied`], newPath: currentPath };

    case 'set-shipping':
      const shippingMethod = args.find(arg => arg.startsWith('--method'))?.split('=')[1];
      if (shippingMethod) {
        return { output: [`Shipping method set to ${shippingMethod}`], newPath: currentPath };
      }
      return { output: ['Invalid set-shipping command'], newPath: currentPath };

    case 'confirm-order':
      if (cart.length === 0) return { output: ['Your cart is empty'], newPath: currentPath };
      const total = calculateTotal();
      const orderId = `ORD${Math.floor(Math.random() * 10000)}`;
      orders.push({ id: orderId, items: [...cart], total });
      cart = [];
      return { output: ['Order confirmed! Thank you for your purchase.', `Order ID: ${orderId}`, `Total: $${total}`], newPath: currentPath };

    // 5. Order Management
    case 'log':
      if (args[0] === 'orders') {
        if (orders.length === 0) return { output: ['No orders found'], newPath: currentPath };
        return {
          output: [
            'Your orders:',
            ...orders.map(order => `Order ${order.id} - Total: $${order.total}`)
          ],
          newPath: currentPath
        };
      }
      return { output: ['Invalid log command'], newPath: currentPath };

    case 'cat':
      if (args[0] === 'order') {
        const orderId = args[1];
        const order = orders.find(o => o.id === orderId);
        if (order) {
          return {
            output: [
              `Order ${order.id}:`,
              ...order.items.map((item: CartItem) => `${item.quantity}x ${item.product}${item.form ? ` (${item.form})` : ''}${item.weight ? ` - ${item.weight}` : ''}`),
              `Total: $${order.total}`
            ],
            newPath: currentPath
          };
        }
        return { output: [`Order ${orderId} not found`], newPath: currentPath };
      }
      // ... (other 'cat' commands)

    case 'track-order':
      const trackOrderId = args[0];
      if (orders.some(o => o.id === trackOrderId)) {
        return { output: [`Order ${trackOrderId} is being processed and will be shipped soon.`], newPath: currentPath };
      }
      return { output: [`Order ${trackOrderId} not found`], newPath: currentPath };

    case 'cancel-order':
      const cancelOrderId = args[0];
      const orderIndex = orders.findIndex(o => o.id === cancelOrderId);
      if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        return { output: [`Order ${cancelOrderId} has been cancelled.`], newPath: currentPath };
      }
      return { output: [`Order ${cancelOrderId} not found`], newPath: currentPath };

    // Help command
    case 'help':
      return {
        output: [
          'Comandos disponibles:',
          '1. Cuenta: login, logout, register, update-account, passwd, whoami',
          '2. Productos: ls products, ls coffee, ls accessories, find coffee, cat product',
          '3. Carrito: add-to-cart, cat cart, rm-from-cart, update-cart, clear cart',
          '4. Pago: checkout, set-payment, apply-coupon, set-shipping, confirm-order',
          '5. Pedidos: log orders, cat order, track-order, cancel-order',
          '6. Sistema de archivos: ls, cd, pwd, cat',
          '7. manual: Abre el manual de usuario',
          'Escribe "[comando] --help" para más información sobre un comando específico.'
        ],
        newPath: currentPath
      };

    case 'cd':
      if (args.length === 0 || args[0] === '~') {
        return { output: [], newPath: '~' };
      }
      if (args[0] === '..') {
        if (pathArray.length > 0) {
          pathArray.pop();
          return { output: [], newPath: pathArray.length === 0 ? '~' : '/' + pathArray.join('/') };
        }
        return { output: ['You are already in the root directory'], newPath: currentPath };
      }
      const newPath = [...pathArray, args[0]];
      const targetDir = findFile(newPath);
      if (targetDir && targetDir.type === 'directory') {
        return { output: [], newPath: '/' + newPath.join('/') };
      }
      return { output: [`Error: Cannot access '${args[0]}': File or directory does not exist`], newPath: currentPath };

    case 'pwd':
      return { output: [currentPath === '~' ? '/home/clicafe' : currentPath], newPath: currentPath };

    case 'exit':
      return { output: ['Exiting CLIcafe Terminal...'], newPath: currentPath };
    case 'manual':
      return { output: ['Abriendo el manual de usuario...'], newPath: currentPath };
    default:
      return { output: [`Error: Unrecognized command: ${cmd}. Type "help" to see available commands.`], newPath: currentPath };
  }
}

function calculateTotal(): number {
  return cart.reduce((total, item) => {
    const product = products.find(p => p.name === item.product);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

