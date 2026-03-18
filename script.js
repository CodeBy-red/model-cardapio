let carrinho = [];

async function fetchMenu() {
    const grid = document.getElementById('cardapio-grid');
    
    try {
        const response = await fetch('/api/cardapio');
        const dados = await response.json();

        grid.innerHTML = dados.map(item => `
            <div class="card">
                <img src="${item.imagem}" alt="${item.nome}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+Indisponível'">
                <div class="content">
                    <h3>${item.nome}</h3>
                    <p>${item.descricao}</p>
                    <span class="price">R$ ${item.preco}</span>
                    <button onclick="adicionarAoCarrinho('${item.nome}', '${item.preco}')">
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        grid.innerHTML = '<p>Erro ao carregar o cardápio.</p>';
    }
}

// 1. Função para adicionar itens à lista
function adicionarAoCarrinho(nome, preco) {
    // Convertemos o preço para número (removemos o R$ e trocamos vírgula por ponto se necessário)
    const precoLimpo = parseFloat(preco.toString().replace(',', '.'));
    
    carrinho.push({ nome, preco: precoLimpo });
    
    // Atualiza o texto do botão flutuante (se você o criar no HTML)
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.innerText = carrinho.length;

    alert(`${nome} adicionado ao carrinho!`);
}

// 2. Função para fechar o pedido e enviar tudo de uma vez
function enviarPedidoWhatsApp() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const numeroWhatsApp = "5511922048764";
    let total = 0;
    let resumoItens = "";

    carrinho.forEach((item, index) => {
        resumoItens += `*${index + 1}. ${item.nome}* - R$ ${item.preco.toFixed(2)}\n`;
        total += item.preco;
    });

    const mensagem = `*Novo Pedido!* 📝\n\n` +
                     `Olá, gostaria de pedir os seguintes itens:\n\n` +
                     `${resumoItens}\n` +
                     `*Total: R$ ${total.toFixed(2)}*\n\n` +
                     `Pode confirmar o recebimento?`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

fetchMenu();