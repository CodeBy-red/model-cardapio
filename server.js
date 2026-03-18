const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();

// 1. Middlewares Iniciais
app.use(cors()); 
app.use(express.json()); 

// 2. Middleware de Segurança (CSP)
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; style-src * 'unsafe-inline';"
    );
    next();
});

// 3. Configuração da Autenticação Google
// Ajuste crucial: Lemos da variável de ambiente e corrigimos as quebras de linha da chave
const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Usamos GOOGLE_SHEET_ID (garanta que este seja o nome na Vercel)
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

// 4. Rota Raiz (Check de Saúde)
app.get('/', (req, res) => {
    res.status(200).json({
        status: "Online",
        message: "API do Cardápio funcionando com sucesso!",
        endpoint: "/api/cardapio"
    });
});

// 5. Rota da API do Cardápio
app.get('/api/cardapio', async (req, res) => {
    try {
        await doc.loadInfo(); 
        const sheet = doc.sheetsByIndex[0]; 
        const rows = await sheet.getRows(); 

        // Na versão 4.x, os dados ficam direto na row (ex: row.Nome)
        const cardapio = rows.map(row => ({
            nome: row.Nome || row._rawData[0], // Tenta pelo nome ou pela primeira coluna
            descricao: row.Descricao || row._rawData[1],
            preco: row.Preco || row._rawData[2],
            disponivel: row.Disponivel || row._rawData[3],
            imagem: row.Imagem || row._rawData[4]
        })).filter(item => item.disponivel?.toLowerCase() === 'sim');

        res.json(cardapio);
    } catch (error) {
        console.error("❌ Erro:", error.message);
        res.status(500).json({ error: 'Erro nos dados', details: error.message });
    }
});

// 6. Exportação para Vercel (Obrigatório ser module.exports = app)
module.exports = app;

const PORT = process.env.PORT || 3000;

// Só inicia o servidor se não estiver na produção (Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n🚀 ==========================================`);
        console.log(`✅ Back-end LOCAL rodando em: http://localhost:${PORT}`);
        console.log(`📡 Rota da API: http://localhost:${PORT}/api/cardapio`);
        console.log(`==============================================\n`);
    });
}