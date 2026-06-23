import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, Phone, Mail, MapPin, PawPrint, Users } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

const Clientes = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(setClients);
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient)
    });
    if (response.ok) {
      const data = await response.json();
      setClients([...clients, { ...newClient, id: data.id }]);
      setShowModal(false);
      setNewClient({ name: '', phone: '', email: '', address: '' });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-zinc-500">Gerencie seus clientes e seus pets.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <UserPlus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou telefone..." 
          className="input-field pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="card p-6 space-y-4 hover:border-emerald-500 transition-all group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <Users size={24} />
              </div>
              <button className="text-zinc-400 hover:text-emerald-600">
                <PawPrint size={20} />
              </button>
            </div>
            <div>
              <h4 className="text-lg font-bold">{client.name}</h4>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Phone size={14} />
                  {client.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Mail size={14} />
                  {client.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <MapPin size={14} />
                  {client.address}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 space-y-6">
            <h3 className="text-xl font-bold">Novo Cliente</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome Completo</label>
                <input 
                  required
                  className="input-field"
                  value={newClient.name}
                  onChange={e => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Telefone</label>
                <input 
                  className="input-field"
                  value={newClient.phone}
                  onChange={e => setNewClient({...newClient, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">E-mail</label>
                <input 
                  type="email"
                  className="input-field"
                  value={newClient.email}
                  onChange={e => setNewClient({...newClient, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Endereço</label>
                <input 
                  className="input-field"
                  value={newClient.address}
                  onChange={e => setNewClient({...newClient, address: e.target.value})}
                />
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

export default Clientes;
