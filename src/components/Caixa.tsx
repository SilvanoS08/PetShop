import React, { useState, useEffect } from 'react';
import { Search, Plus, ShoppingCart, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const Caixa = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const response = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total })
    });

    if (response.ok) {
      setIsSuccess(true);
      setCart([]);
      setTimeout(() => setIsSuccess(false), 3000);
      // Refresh products to update stock
      fetch('/api/products').then(res => res.json()).then(setProducts);
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col gap-8 overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Caixa</h2>
          <p className="text-zinc-500">Registre novas vendas de forma rápida.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Product Selection */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar produto por nome..." 
              className="input-field pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {filteredProducts.map(product => (
              <div key={product.id} className="card p-4 flex justify-between items-center hover:border-emerald-500 transition-colors cursor-pointer group" onClick={() => addToCart(product)}>
                <div>
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-zinc-500">{product.category} • {product.stock} em estoque</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-600">R$ {product.price.toFixed(2)}</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Plus size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="card flex flex-col bg-zinc-50/50">
          <div className="p-6 border-b border-zinc-200 bg-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart size={20} />
              Carrinho
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex justify-between items-center bg-white p-3 rounded-xl border border-zinc-100 shadow-sm"
                >
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold truncate max-w-[150px]">{item.name}</h5>
                    <p className="text-xs text-zinc-500">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="text-sm">Carrinho vazio</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-zinc-200 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-emerald-600">R$ {total.toFixed(2)}</span>
            </div>
            
            <button 
              className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              {isSuccess ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  Venda Realizada!
                </span>
              ) : (
                'Finalizar Venda'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Caixa;
