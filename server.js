const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    try { return JSON.parse(data); } catch (e) { return []; }
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/products', (req, res) => {
    res.json(readDB());
});

app.post('/api/products', (req, res) => {
    const products = readDB();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { id: newId, ...req.body };
    products.push(newProduct);
    writeDB(products);
    res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const products = readDB();
    const id = Number(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body, id };
        writeDB(products);
        res.json(products[index]);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    let products = readDB();
    const id = Number(req.params.id);
    products = products.filter(p => p.id !== id);
    writeDB(products);
    res.json({ success: true });
});

// مسار استقبال وحفظ طلبات الزبائن وتخزينها في orders.json
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    console.log('📦 طلب جديد تم استقباله:', JSON.stringify(newOrder, null, 2));
    
    const ordersFile = path.join(__dirname, 'orders.json');
    let orders = [];
    if (fs.existsSync(ordersFile)) {
        try {
            orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
        } catch (err) {
            orders = [];
        }
    }
    
    orders.push({ ...newOrder, date: new Date().toISOString() });
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    
    res.json({ success: true, message: 'تم إتمام الطلب بنجاح!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
