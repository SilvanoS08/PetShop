import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("petshop.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    name TEXT NOT NULL,
    species TEXT,
    breed TEXT,
    age INTEGER,
    FOREIGN KEY (client_id) REFERENCES clients (id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total REAL NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY (sale_id) REFERENCES sales (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );
`);

// Seed data if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare("INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)");
  insertProduct.run("Ração Premium 10kg", 150.00, 20, "Alimentação");
  insertProduct.run("Shampoo Antipulgas", 35.50, 15, "Higiene");
  insertProduct.run("Brinquedo Mordedor", 25.00, 30, "Acessórios");
  insertProduct.run("Coleira Ajustável", 45.00, 10, "Acessórios");
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  
  // Clients
  app.get("/api/clients", (req, res) => {
    const clients = db.prepare("SELECT * FROM clients").all();
    res.json(clients);
  });

  app.post("/api/clients", (req, res) => {
    const { name, phone, email, address } = req.body;
    const result = db.prepare("INSERT INTO clients (name, phone, email, address) VALUES (?, ?, ?, ?)").run(name, phone, email, address);
    res.json({ id: result.lastInsertRowid });
  });

  // Pets
  app.get("/api/pets", (req, res) => {
    const pets = db.prepare("SELECT p.*, c.name as client_name FROM pets p JOIN clients c ON p.client_id = c.id").all();
    res.json(pets);
  });

  app.post("/api/pets", (req, res) => {
    const { client_id, name, species, breed, age } = req.body;
    const result = db.prepare("INSERT INTO pets (client_id, name, species, breed, age) VALUES (?, ?, ?, ?, ?)").run(client_id, name, species, breed, age);
    res.json({ id: result.lastInsertRowid });
  });

  // Products
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, price, stock, category } = req.body;
    const result = db.prepare("INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)").run(name, price, stock, category);
    res.json({ id: result.lastInsertRowid });
  });

  // Sales
  app.get("/api/sales", (req, res) => {
    const sales = db.prepare("SELECT * FROM sales ORDER BY date DESC").all();
    res.json(sales);
  });

  app.post("/api/sales", (req, res) => {
    const { items, total } = req.body;
    
    const transaction = db.transaction(() => {
      const saleResult = db.prepare("INSERT INTO sales (total) VALUES (?)").run(total);
      const saleId = saleResult.lastInsertRowid;

      const insertItem = db.prepare("INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
      const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

      for (const item of items) {
        insertItem.run(saleId, item.id, item.quantity, item.price);
        updateStock.run(item.quantity, item.id);
      }
      return saleId;
    });

    try {
      const saleId = transaction();
      res.json({ id: saleId });
    } catch (error) {
      res.status(500).json({ error: "Erro ao processar venda" });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const totalSales = db.prepare("SELECT SUM(total) as total FROM sales").get() as { total: number };
    const totalClients = db.prepare("SELECT COUNT(*) as count FROM clients").get() as { count: number };
    const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
    const recentSales = db.prepare("SELECT date, total FROM sales ORDER BY date DESC LIMIT 7").all();
    
    res.json({
      revenue: totalSales.total || 0,
      clients: totalClients.count,
      products: totalProducts.count,
      recentSales: recentSales.reverse()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
