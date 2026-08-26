
import { useCart } from '../context/CartContext';

export function Menu() {
  const { adicionarItem } = useCart();

  const pizzas = [
    { id: '1', nome: 'Margherita', preco: 35.90 },
    { id: '2', nome: 'Calabresa', preco: 38.90 },
  ];

  const handleAdicionar = (pizza: any) => {
    adicionarItem({
    id: pizza.id,
    nome: pizza.nome,
    precoUnitario: pizza.preco,
    quantidade: 1,
    });
    alert(`${pizza.nome} adicionada ao carrinho!`);
  };

  return (
    <div>
      <h1>Cardápio</h1>
      {pizzas.map((pizza) => (
        <div key={pizza.id} style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0' }}>
          <h3>{pizza.nome}</h3>
          <p>R$ {pizza.preco.toFixed(2)}</p>
          <button 
            onClick={() => handleAdicionar(pizza)}
            style={{
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Adicionar ao Carrinho
          </button>
        </div>
      ))}
    </div>
  );
}