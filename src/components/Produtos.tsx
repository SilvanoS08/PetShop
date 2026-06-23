import React, { useState, useEffect } from 'react';
import { Search, Plus, PackagePlus, Tag, BarChart3 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const Produtos = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: 'Alimentação' });

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      })
    });
    if (response.ok) {
      const data = await response.json();
      setProducts([...products, { 
        ...newProduct, 
        id: data.id, 
        price: parseFloat(newProduct.price), 
        stock: parseInt(newProduct.stock) 
      } as Product]);
      setShowModal(false);
      setNewProduct({ name: '', price: '', stock: '', category: 'Alimentação' });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-zinc-500">Gerencie seu estoque e catálogo.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <PackagePlus size={20} />
          Novo Produto
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou categoria..." 
          className="input-field pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Produto</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Categoria</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-600">Estoque</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-600 text-right">Preço</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium">{product.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-medium">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className="text-sm">{product.stock} unidades</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-emerald-600">R$ {product.price.toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 space-y-6">
            <h3 className="text-xl font-bold">Novo Produto</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome do Produto</label>
                <input 
                  required
                  className="input-field"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Preço (R$)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Estoque Inicial</label>
                  <input 
                    required
                    type="number"
                    className="input-field"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Categoria</label>
                <select 
                  className="input-field"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option>Alimentação</option>
                  <option>Higiene</option>
                  <option>Acessórios</option>
                  <option>Saúde</option>
                  <option>Serviços</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 justify-center">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produtos;
