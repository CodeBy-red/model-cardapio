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
                    <button onclick="enviarWhats('${item.nome}', '${item.preco}')">
                        Pedir no WhatsApp
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        grid.innerHTML = '<p>Erro ao carregar o cardápio.</p>';
    }
}

function enviarWhats(produto, preco) {
    const numeroWhatsApp = "5511922048764"; // COLOQUE O NÚMERO AQUI (com DDD e sem espaços)
    
    // Criamos a mensagem personalizada
    const mensagem = `Olá! Gostaria de pedir o seguinte item do cardápio:\n\n` +
                     `*Produto:* ${produto}\n` +
                     `*Valor:* R$ ${preco}\n\n` +
                     `Pode me informar o prazo de entrega?`;

    // Codificamos a mensagem para URL (converte espaços em %20, etc)
    const mensagemFormatada = encodeURIComponent(mensagem);
    
    // Link final
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensagemFormatada}`;
    
    // Abre em uma nova aba
    window.open(url, '_blank');
}

fetchMenu();