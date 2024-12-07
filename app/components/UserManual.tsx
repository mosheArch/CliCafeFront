import React from 'react'

interface UserManualProps {
  onClose: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto text-green-400 shadow-lg border border-green-500">
        <div className="sticky top-0 bg-gray-800 p-4 border-b border-green-500 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manual de Usuario de CLIcafe Terminal</h1>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Cerrar
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-2">1. Comenzando</h2>
            <p>Para comenzar a usar CLIcafe Terminal, simplemente escribe comandos en el prompt. Usa el comando <code className="bg-gray-700 px-1 rounded">help</code> para ver una lista de comandos disponibles.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">2. Gestión de Cuenta</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">register --user=email@ejemplo.com --password=contraseña --name="Nombre Completo"</code>: Crea una nueva cuenta</li>
              <li><code className="bg-gray-700 px-1 rounded">login --user=email@ejemplo.com --password=contraseña</code>: Inicia sesión en tu cuenta</li>
              <li><code className="bg-gray-700 px-1 rounded">logout</code>: Cierra la sesión actual</li>
              <li><code className="bg-gray-700 px-1 rounded">update-account --email=nuevo@email.com --phone="+1234567890"</code>: Actualiza la información de tu cuenta</li>
              <li><code className="bg-gray-700 px-1 rounded">passwd</code>: Cambia tu contraseña (actualmente no implementado)</li>
              <li><code className="bg-gray-700 px-1 rounded">whoami</code>: Muestra la información del usuario actual</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">3. Navegación de Productos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">ls products</code>: Lista todos los productos disponibles</li>
              <li><code className="bg-gray-700 px-1 rounded">ls coffee</code>: Lista todos los productos de café</li>
              <li><code className="bg-gray-700 px-1 rounded">ls coffee --form="Grano Entero"</code>: Lista productos de café de una forma específica</li>
              <li><code className="bg-gray-700 px-1 rounded">ls accessories</code>: Lista todos los accesorios</li>
              <li><code className="bg-gray-700 px-1 rounded">find coffee --type="Arábica" --origin="Colombia" --roast="Medio"</code>: Busca café específico</li>
              <li><code className="bg-gray-700 px-1 rounded">cat product COL001</code>: Muestra detalles de un producto específico</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">4. Gestión del Carrito</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">add-to-cart --product=COL001 --form="Grano Entero" --weight=1kg --quantity=2</code>: Añade un producto al carrito</li>
              <li><code className="bg-gray-700 px-1 rounded">cat cart</code>: Ve el contenido de tu carrito</li>
              <li><code className="bg-gray-700 px-1 rounded">rm-from-cart "Supremo Colombiano"</code>: Elimina un producto del carrito</li>
              <li><code className="bg-gray-700 px-1 rounded">update-cart "Supremo Colombiano" --quantity=3</code>: Actualiza la cantidad de un producto en el carrito</li>
              <li><code className="bg-gray-700 px-1 rounded">clear cart</code>: Elimina todos los items del carrito</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">5. Proceso de Pago</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">checkout</code>: Comienza el proceso de pago</li>
              <li><code className="bg-gray-700 px-1 rounded">set-payment --method=tarjeta-credito</code>: Establece tu método de pago</li>
              <li><code className="bg-gray-700 px-1 rounded">apply-coupon CAFE20</code>: Aplica un código de cupón</li>
              <li><code className="bg-gray-700 px-1 rounded">set-shipping --method=estandar</code>: Establece tu método de envío</li>
              <li><code className="bg-gray-700 px-1 rounded">confirm-order</code>: Finaliza y realiza tu pedido</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">6. Gestión de Pedidos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">log orders</code>: Ve una lista de tus pedidos</li>
              <li><code className="bg-gray-700 px-1 rounded">cat order PED1234</code>: Ve detalles de un pedido específico</li>
              <li><code className="bg-gray-700 px-1 rounded">track-order PED1234</code>: Verifica el estado de un pedido</li>
              <li><code className="bg-gray-700 px-1 rounded">cancel-order PED1234</code>: Cancela un pedido existente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">7. Navegación del Sistema de Archivos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">ls</code>: Lista el contenido del directorio actual</li>
              <li><code className="bg-gray-700 px-1 rounded">cd nombre_directorio</code>: Cambia a un directorio diferente</li>
              <li><code className="bg-gray-700 px-1 rounded">cd ..</code>: Sube un nivel de directorio</li>
              <li><code className="bg-gray-700 px-1 rounded">pwd</code>: Muestra el directorio de trabajo actual</li>
            </ul>
          </section>

          <p className="mt-6">Recuerda, siempre puedes escribir <code className="bg-gray-700 px-1 rounded">help</code> para ver una lista de comandos disponibles, o <code className="bg-gray-700 px-1 rounded">[comando] --help</code> para más información sobre un comando específico.</p>
        </div>
      </div>
    </div>
  )
}

export default UserManual

