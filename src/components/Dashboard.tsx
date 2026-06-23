import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Stats {
  revenue: number;
  clients: number;
  products: number;
  recentSales: { date: string; total: number }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="p-8">Carregando...</div>;

  const chartData = stats.recentSales.map(s => ({
    date: format(new Date(s.date), 'dd/MM', { locale: ptBR }),
    total: s.total
  }));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-zinc-500">Bem-vindo de volta! Aqui está o resumo do seu pet shop.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Receita Total" 
          value={`R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={DollarSign}
          trend="+12.5%"
          isPositive={true}
        />
        <StatCard 
          title="Clientes" 
          value={stats.clients.toString()} 
          icon={Users}
          trend="+3"
          isPositive={true}
        />
        <StatCard 
          title="Produtos" 
          value={stats.products.toString()} 
          icon={Package}
          trend="Estável"
          isPositive={true}
        />
        <StatCard 
          title="Vendas Hoje" 
          value="R$ 450,00" 
          icon={TrendingUp}
          trend="+5.2%"
          isPositive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold mb-6">Vendas Recentes</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-6">Top Categorias</h3>
          <div className="space-y-4">
            <CategoryItem label="Alimentação" percentage={65} color="bg-emerald-500" />
            <CategoryItem label="Higiene" percentage={20} color="bg-blue-500" />
            <CategoryItem label="Acessórios" percentage={15} color="bg-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, isPositive }: any) => (
  <div className="card p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-50 rounded-lg text-zinc-600">
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {trend}
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </div>
    </div>
    <div>
      <p className="text-sm text-zinc-500 font-medium">{title}</p>
      <h4 className="text-2xl font-bold mt-1">{value}</h4>
    </div>
  </div>
);

const CategoryItem = ({ label, percentage, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="font-medium">{label}</span>
      <span className="text-zinc-500">{percentage}%</span>
    </div>
    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

export default Dashboard;
