/* =============================================================
   Arquivo: app.js
   Objetivo: controlar tema (dark/light), cópia de códigos,
             filtro de cartões e atalhos de teclado.
   Estilo: comentários verbosos; variáveis e funções em português.
   ============================================================= */

// ---------- Utilitários de seleção de elementos ----------

// Seleciona um único elemento usando CSS Selector.
// `seletor`: string do seletor; `escopo`: elemento pai opcional.
const selecionar = (seletor, escopo = document) => escopo.querySelector(seletor);

// Seleciona múltiplos elementos e converte NodeList em Array.
// Útil para usar métodos como forEach/map.
const selecionarTodos = (seletor, escopo = document) => Array.from(escopo.querySelectorAll(seletor));

// ---------- Persistência de tema (dark/light) ----------

// Referência para o elemento <html> para armazenar atributo data-theme.
const raizDocumento = document.documentElement;

// Carrega tema salvo do localStorage (se existir).
const temaSalvo = localStorage.getItem('theme');
if (temaSalvo) {
  raizDocumento.setAttribute('data-theme', temaSalvo);
}

// Botão que alterna o tema ao ser clicado.
const botaoTema = selecionar('#botaoTema');

// Adiciona escutador de eventos de clique para alternar o tema.
botaoTema?.addEventListener('click', () => {
  // Lê o tema atual; se for light muda para dark, senão para light.
  const temaAtual = raizDocumento.getAttribute('data-theme') === 'light' ? 'dark' : 'light';

  // Aplica o novo tema no atributo do <html> (CSS reage a isso).
  raizDocumento.setAttribute('data-theme', temaAtual);

  // Persiste a escolha para próximas visitas.
  localStorage.setItem('theme', temaAtual);

  // Acessibilidade: informa ao leitor de tela o estado do botão.
  botaoTema.setAttribute('aria-pressed', String(temaAtual === 'light'));
});

// ---------- Cópia de código com feedback visual ----------

// Percorre todos os blocos com a classe .codebox.
selecionarTodos('.codebox').forEach((caixaCodigo) => {
  // Busca o botão de cópia dentro da caixa atual.
  const botaoCopiar = selecionar('.copy', caixaCodigo);

  // Captura o texto contido no elemento <code>.
  const textoCodigo = selecionar('code', caixaCodigo)?.innerText || '';

  // Adiciona escutador para acionar a cópia ao clicar.
  botaoCopiar?.addEventListener('click', async () => {
    try {
      // Tenta copiar usando a API moderna do navegador.
      await navigator.clipboard.writeText(textoCodigo);
    } catch {
      // Fallback: cria um <textarea>, seleciona e copia via execCommand.
      const area = document.createElement('textarea');
      area.value = textoCodigo;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }

    // Visual: contorna a caixa indicando sucesso na cópia.
    caixaCodigo.setAttribute('data-copied', 'true');

    // Troca texto do botão temporariamente para “Copiado!”
    const textoOriginal = botaoCopiar.textContent;
    botaoCopiar.textContent = 'Copiado!';

    // Após 1,4s, restaura estado visual e texto do botão.
    setTimeout(() => {
      caixaCodigo.removeAttribute('data-copied');
      botaoCopiar.textContent = textoOriginal || 'Copiar';
    }, 1400);
  });
});

// ---------- Filtro de cartões por termo digitado ----------

// Input de busca que controla o filtro dos cartões.
const entradaBusca = selecionar('#entradaBusca');

// Container principal que guarda todos os cartões.
const gradeCartoes = selecionar('#gradeCartoes');

// Quando o usuário digitar algo no campo de busca, filtramos.
entradaBusca?.addEventListener('input', () => {
  // Normalizamos o termo: removemos espaços extras e jogamos para minúsculas.
  const termo = entradaBusca.value.trim().toLowerCase();

  // Percorremos todas as seções .card e verificamos se elas possuem o termo.
  selecionarTodos('section.card', gradeCartoes).forEach((cartao) => {
    // “Feno do palheiro”: somamos texto visível + atributos data-tags para busca.
    const conteudoParaBusca = (cartao.innerText + ' ' + (cartao.getAttribute('data-tags') || '')).toLowerCase();

    // Exibe ou esconde o cartão conforme correspondente.
    cartao.style.display = conteudoParaBusca.includes(termo) ? '' : 'none';
  });
});

// ---------- Atalhos de teclado para agilidade ----------

document.addEventListener('keydown', (evento) => {
  const tecla = evento.key.toLowerCase();
  const modificadorAtivo = evento.ctrlKey || evento.metaKey;

  // Ctrl/Cmd + K => focar na barra de busca.
  if (modificadorAtivo && tecla === 'k') {
    evento.preventDefault();
    entradaBusca?.focus();
  }

  // Ctrl/Cmd + B => alternar o tema.
  if (modificadorAtivo && tecla === 'b') {
    evento.preventDefault();
    botaoTema?.click();
  }
});
