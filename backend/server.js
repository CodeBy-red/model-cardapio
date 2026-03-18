const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();

// 1. Middlewares Iniciais
app.use(cors()); // Permite acesso do seu Front-end (Live Server)
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições

// 2. Middleware de Segurança (CSP) - Resolve erros de bloqueio do navegador
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; style-src * 'unsafe-inline';"
    );
    next();
});

// 3. Configuração da Autenticação Google via Service Account
const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: require('./credentials.json').private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

// 4. Rota Raiz - Evita erro 404 ao abrir http://localhost:3000/
app.get('/', (req, res) => {
    res.status(200).send({
        status: "Online",
        message: "API do Cardápio funcionando. Use /api/cardapio para acessar os dados."
    });
});

// 5. Rota da API do Cardápio
app.get('/api/cardapio', async (req, res) => {
    try {
        await doc.loadInfo(); 
        const sheet = doc.sheetsByIndex[0]; 
        const rows = await sheet.getRows(); 

        const cardapio = rows.map(row => ({
            nome: row.get('Nome'),
            descricao: row.get('Descricao'),
            preco: row.get('Preco'),
            disponivel: row.get('Disponivel'),
            imagem: row.get('Imagem')
        })).filter(item => item.disponivel?.toLowerCase() === 'sim');

        res.json(cardapio);
    } catch (error) {
        console.error("❌ Erro ao buscar dados:", error.message);
        res.status(500).json({ 
            error: 'Erro ao conectar com Google Sheets',
            details: error.message 
        });
    }
});

// 6. Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 ==========================================`);
    console.log(`✅ Back-end rodando em: http://localhost:${PORT}`);
    console.log(`📡 Rota da API: http://localhost:${PORT}/api/cardapio`);
    console.log(`==============================================\n`);
});