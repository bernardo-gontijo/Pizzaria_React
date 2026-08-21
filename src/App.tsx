import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { TenantConfigProvider } from './context/TenantConfigContext';

function App() {
  return (
    <TenantConfigProvider>
      <AuthProvider>
        <CartProvider>
          <main>
            <h1>PizzaShop</h1>

            <p>
              Plataforma de pedidos de pizza
            </p>
          </main>
        </CartProvider>
      </AuthProvider>
    </TenantConfigProvider>
  );
}

export default App;