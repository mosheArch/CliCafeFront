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
              <li><code className="bg-gray-700 px-1 rounded">ssh -i correo@ejemplo.com</code>: Inicia sesión en tu cuenta. Se te pedirá la contraseña después de ingresar este comando.</li>
              <li><code className="bg-gray-700 px-1 rounded">register</code>: Inicia el proceso de registro para una nueva cuenta.</li>
              <li><code className="bg-gray-700 px-1 rounded">passwd correo@ejemplo.com</code>: Restablece la contraseña de la cuenta especificada.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">3. Navegación de Productos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">ls productos</code>: Lista todos los productos disponibles.</li>
              <li><code className="bg-gray-700 px-1 rounded">ls productos --categoria=ID</code>: Lista productos de una categoría específica.</li>
              <li><code className="bg-gray-700 px-1 rounded">ls productos --tipo=GRANO|MOLIDO</code>: Lista productos por tipo de café.</li>
              <li><code className="bg-gray-700 px-1 rounded">ls productos --peso=250|500|1000</code>: Lista productos por peso en gramos.</li>
              <li><code className="bg-gray-700 px-1 rounded">vi ID_PRODUCTO</code>: Muestra detalles de un producto específico.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">4. Gestión del Carrito</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">ver carrito</code>: Muestra el contenido actual del carrito.</li>
              <li><code className="bg-gray-700 px-1 rounded">agregar carrito --producto=ID --cantidad=N</code>: Añade un producto al carrito.</li>
              <li><code className="bg-gray-700 px-1 rounded">actualizar carrito --item=ID --cantidad=N</code>: Actualiza la cantidad de un item en el carrito.</li>
              <li><code className="bg-gray-700 px-1 rounded">eliminar carrito --item=ID</code>: Elimina un item del carrito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">5. Proceso de Pago</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">pagar</code>: Inicia el proceso de pago. Deberás proporcionar la información de envío.</li>
              <li>Ejemplo de comando de pago completo:</li>
              <li><code className="bg-gray-700 px-1 rounded">pagar --calle="Nombre de la Calle" --numero_exterior="123" --colonia="Nombre de la Colonia" --ciudad="Ciudad" --estado="Estado" --codigo_postal="12345"</code></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">6. Comandos Adicionales</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">help</code>: Muestra una lista de comandos disponibles.</li>
              <li><code className="bg-gray-700 px-1 rounded">exit</code>: Cierra la sesión actual y sale del terminal.</li>
            </ul>
          </section>

          <p className="mt-6">Recuerda, siempre puedes escribir <code className="bg-gray-700 px-1 rounded">help</code> para ver una lista de comandos disponibles en cualquier momento.</p>
        </div>
      </div>
    </div>
  )
}

export default UserManual

