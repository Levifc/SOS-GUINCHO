const API = '/api';
const statusLista = ['Solicitado', 'Em análise', 'Guincho a caminho', 'Em atendimento', 'Finalizado', 'Cancelado'];

const estado = {
  token: localStorage.getItem('token') || '',
  usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
  motoristas: []
};

const $ = (seletor) => document.querySelector(seletor);

function moeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dataBR(data) {
  if (!data) return '-';
  return new Date(data).toLocaleString('pt-BR');
}

function limparHTML(texto) {
  return String(texto ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function classeStatus(status) {
  const mapa = {
    'Solicitado': 'solicitado',
    'Em análise': 'analise',
    'Guincho a caminho': 'caminho',
    'Em atendimento': 'atendimento',
    'Finalizado': 'finalizado',
    'Cancelado': 'cancelado'
  };
  return mapa[status] || '';
}

function badgeStatus(status) {
  return `<span class="badge ${classeStatus(status)}">${limparHTML(status)}</span>`;
}

function mostrarMensagem(texto, erro = false) {
  const area = $('#areaMensagem');
  area.textContent = texto;
  area.classList.toggle('erro', erro);
  area.classList.remove('oculto');
  setTimeout(() => area.classList.add('oculto'), 4500);
}

async function requisicao(caminho, opcoes = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opcoes.headers || {}) };
  if (estado.token) headers.Authorization = `Bearer ${estado.token}`;

  const resposta = await fetch(`${API}${caminho}`, { ...opcoes, headers });
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro ao processar solicitação.');
  }

  return dados;
}

function salvarSessao(token, usuario) {
  estado.token = token;
  estado.usuario = usuario;
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function sair() {
  estado.token = '';
  estado.usuario = null;
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  renderizarTela();
}

function renderizarTela() {
  const logado = Boolean(estado.token && estado.usuario);
  $('#areaAuth').classList.toggle('oculto', logado);
  $('#areaDashboard').classList.toggle('oculto', !logado);
  $('#btnSair').classList.toggle('oculto', !logado);

  $('#dashboardCliente').classList.add('oculto');
  $('#dashboardAdmin').classList.add('oculto');
  $('#dashboardMotorista').classList.add('oculto');

  if (!logado) return;

  $('#perfilUsuario').textContent = `Perfil: ${estado.usuario.perfil}`;
  $('#saudacaoUsuario').textContent = `Olá, ${estado.usuario.nome}`;

  if (estado.usuario.perfil === 'cliente') {
    $('#dashboardCliente').classList.remove('oculto');
    carregarPedidosCliente();
  }

  if (estado.usuario.perfil === 'administrador') {
    $('#dashboardAdmin').classList.remove('oculto');
    carregarMotoristas().then(carregarPedidosAdmin);
  }

  if (estado.usuario.perfil === 'motorista') {
    $('#dashboardMotorista').classList.remove('oculto');
    carregarAtendimentosMotorista();
  }
}

function obterDadosForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function fazerLogin(evento) {
  evento.preventDefault();
  const dados = obterDadosForm(evento.target);

  try {
    const resposta = await requisicao('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    salvarSessao(resposta.token, resposta.usuario);
    mostrarMensagem('Login realizado com sucesso.');
    evento.target.reset();
    renderizarTela();
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

async function cadastrarCliente(evento) {
  evento.preventDefault();
  const dados = obterDadosForm(evento.target);

  try {
    await requisicao('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    mostrarMensagem('Cliente cadastrado. Agora faça login.');
    evento.target.reset();
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

async function atualizarValorEstimado() {
  const form = $('#formPedido');
  const dados = obterDadosForm(form);

  if (!dados.tipo_servico) {
    $('#valorEstimado').textContent = moeda(0);
    return;
  }

  try {
    const resposta = await requisicao('/pedidos/calcular-valor', {
      method: 'POST',
      body: JSON.stringify({
        tipo_servico: dados.tipo_servico,
        tipo_problema: dados.tipo_problema
      })
    });
    $('#valorEstimado').textContent = moeda(resposta.valor_estimado);
  } catch (error) {
    $('#valorEstimado').textContent = moeda(0);
  }
}

async function criarPedido(evento) {
  evento.preventDefault();
  const dados = obterDadosForm(evento.target);

  try {
    const resposta = await requisicao('/pedidos', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    mostrarMensagem(`Pedido #${resposta.id_pedido} confirmado. Valor: ${moeda(resposta.valor_estimado)}.`);
    evento.target.reset();
    $('#valorEstimado').textContent = moeda(0);
    carregarPedidosCliente();
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

async function carregarPedidosCliente() {
  const area = $('#listaPedidosCliente');
  area.innerHTML = '<p class="texto-suave">Carregando pedidos...</p>';

  try {
    const pedidos = await requisicao('/pedidos/meus');

    if (!pedidos.length) {
      area.innerHTML = '<p class="texto-suave">Nenhum pedido cadastrado ainda.</p>';
      return;
    }

    area.innerHTML = pedidos.map((pedido) => `
      <div class="item-pedido">
        <h4>Pedido #${pedido.id_pedido} ${badgeStatus(pedido.nome_status)}</h4>
        <p><strong>Data:</strong> ${dataBR(pedido.data_hora_solicitacao)}</p>
        <p><strong>Veículo:</strong> ${limparHTML(pedido.modelo)} — ${limparHTML(pedido.placa)}</p>
        <p><strong>Serviço:</strong> ${limparHTML(pedido.tipo_servico)} / ${limparHTML(pedido.tipo_problema)}</p>
        <p><strong>Local:</strong> ${limparHTML(pedido.endereco_atendimento)} (${limparHTML(pedido.localizacao)})</p>
        <p><strong>Motorista:</strong> ${pedido.nome_motorista ? limparHTML(pedido.nome_motorista) : 'Ainda não atribuído'}</p>
        <p><strong>Valor estimado:</strong> ${moeda(pedido.valor_estimado)}</p>
      </div>
    `).join('');
  } catch (error) {
    area.innerHTML = '<p class="texto-suave">Não foi possível carregar os pedidos.</p>';
    mostrarMensagem(error.message, true);
  }
}

async function carregarMotoristas() {
  try {
    estado.motoristas = await requisicao('/admin/motoristas');
  } catch (error) {
    estado.motoristas = [];
    mostrarMensagem(error.message, true);
  }
}

function paramsFiltrosAdmin() {
  const dados = obterDadosForm($('#formFiltrosAdmin'));
  const params = new URLSearchParams();
  Object.entries(dados).forEach(([chave, valor]) => {
    if (valor) params.set(chave, valor);
  });
  return params.toString();
}

async function carregarPedidosAdmin(evento) {
  if (evento) evento.preventDefault();
  const tabela = $('#tabelaPedidosAdmin');
  tabela.innerHTML = '<tr><td colspan="7">Carregando pedidos...</td></tr>';

  try {
    const qs = paramsFiltrosAdmin();
    const pedidos = await requisicao(`/admin/pedidos${qs ? `?${qs}` : ''}`);

    if (!pedidos.length) {
      tabela.innerHTML = '<tr><td colspan="7">Nenhum pedido encontrado.</td></tr>';
      return;
    }

    tabela.innerHTML = pedidos.map((pedido) => {
      const options = estado.motoristas.map((motorista) => `
        <option value="${motorista.id_motorista}" ${Number(pedido.id_motorista) === Number(motorista.id_motorista) ? 'selected' : ''}>
          ${limparHTML(motorista.nome)} — ${limparHTML(motorista.placa_guincho)}
        </option>
      `).join('');

      return `
        <tr>
          <td>#${pedido.id_pedido}<br><small>${dataBR(pedido.data_hora_solicitacao)}</small></td>
          <td>${limparHTML(pedido.nome_cliente)}<br><small>${limparHTML(pedido.telefone_cliente)}</small></td>
          <td>${limparHTML(pedido.modelo)}<br><small>${limparHTML(pedido.placa)}</small></td>
          <td>${badgeStatus(pedido.nome_status)}</td>
          <td>${moeda(pedido.valor_estimado)}</td>
          <td>
            <select data-motorista-pedido="${pedido.id_pedido}">
              <option value="">Sem motorista</option>
              ${options}
            </select>
          </td>
          <td><button class="botao pequeno" data-atribuir="${pedido.id_pedido}">Atribuir</button></td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    tabela.innerHTML = '<tr><td colspan="7">Erro ao carregar pedidos.</td></tr>';
    mostrarMensagem(error.message, true);
  }
}

async function atribuirMotorista(idPedido) {
  const select = document.querySelector(`[data-motorista-pedido="${idPedido}"]`);
  const id_motorista = select.value;

  if (!id_motorista) {
    mostrarMensagem('Selecione um motorista antes de atribuir.', true);
    return;
  }

  try {
    await requisicao(`/admin/pedidos/${idPedido}/atribuir`, {
      method: 'PATCH',
      body: JSON.stringify({ id_motorista })
    });
    mostrarMensagem('Motorista atribuído com sucesso.');
    carregarPedidosAdmin();
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

async function gerarRelatorio() {
  const box = $('#resumoRelatorio');

  try {
    const qs = paramsFiltrosAdmin();
    const relatorio = await requisicao(`/admin/relatorio${qs ? `?${qs}` : ''}`);
    const r = relatorio.resumo;

    box.innerHTML = `
      <div><span>Total de pedidos</span><strong>${r.total_pedidos}</strong></div>
      <div><span>Confirmados</span><strong>${r.total_confirmados}</strong></div>
      <div><span>Valor total</span><strong>${moeda(r.valor_total_estimado)}</strong></div>
      <div><span>Média</span><strong>${moeda(r.media_valor_estimado)}</strong></div>
    `;
    box.classList.remove('oculto');
    mostrarMensagem('Relatório gerado com sucesso.');
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

async function carregarAtendimentosMotorista() {
  const area = $('#listaAtendimentosMotorista');
  area.innerHTML = '<p class="texto-suave">Carregando atendimentos...</p>';

  try {
    const atendimentos = await requisicao('/motorista/atendimentos');

    if (!atendimentos.length) {
      area.innerHTML = '<p class="texto-suave">Nenhum atendimento atribuído no momento.</p>';
      return;
    }

    area.innerHTML = atendimentos.map((atendimento) => `
      <div class="item-pedido">
        <h4>Atendimento #${atendimento.id_pedido} ${badgeStatus(atendimento.nome_status)}</h4>
        <p><strong>Cliente:</strong> ${limparHTML(atendimento.nome_cliente)} — ${limparHTML(atendimento.telefone_cliente)}</p>
        <p><strong>Data:</strong> ${dataBR(atendimento.data_hora_solicitacao)}</p>
        <p><strong>Local:</strong> ${limparHTML(atendimento.endereco_atendimento)} (${limparHTML(atendimento.localizacao)})</p>
        <p><strong>Veículo:</strong> ${limparHTML(atendimento.modelo)} — ${limparHTML(atendimento.placa)}</p>
        <p><strong>Problema:</strong> ${limparHTML(atendimento.tipo_problema)} — ${limparHTML(atendimento.descricao_problema || 'Sem descrição')}</p>
        <label class="formulario">
          Atualizar status
          <select data-status-atendimento="${atendimento.id_pedido}">
            ${statusLista.map((s) => `<option ${s === atendimento.nome_status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </label>
        <button class="botao pequeno" data-atualizar-status="${atendimento.id_pedido}">Salvar status</button>
      </div>
    `).join('');
  } catch (error) {
    area.innerHTML = '<p class="texto-suave">Não foi possível carregar os atendimentos.</p>';
    mostrarMensagem(error.message, true);
  }
}

async function atualizarStatusAtendimento(idPedido) {
  const select = document.querySelector(`[data-status-atendimento="${idPedido}"]`);
  const nome_status = select.value;

  try {
    await requisicao(`/motorista/atendimentos/${idPedido}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ nome_status })
    });
    mostrarMensagem('Status atualizado com sucesso.');
    carregarAtendimentosMotorista();
  } catch (error) {
    mostrarMensagem(error.message, true);
  }
}

document.addEventListener('click', (evento) => {
  const btnAtribuir = evento.target.closest('[data-atribuir]');
  if (btnAtribuir) atribuirMotorista(btnAtribuir.dataset.atribuir);

  const btnStatus = evento.target.closest('[data-atualizar-status]');
  if (btnStatus) atualizarStatusAtendimento(btnStatus.dataset.atualizarStatus);
});

$('#btnSair').addEventListener('click', sair);
$('#formLogin').addEventListener('submit', fazerLogin);
$('#formCadastro').addEventListener('submit', cadastrarCliente);
$('#formPedido').addEventListener('submit', criarPedido);
$('#formPedido').addEventListener('change', atualizarValorEstimado);
$('#btnAtualizarCliente').addEventListener('click', carregarPedidosCliente);
$('#formFiltrosAdmin').addEventListener('submit', carregarPedidosAdmin);
$('#btnRelatorio').addEventListener('click', gerarRelatorio);
$('#btnAtualizarMotorista').addEventListener('click', carregarAtendimentosMotorista);

renderizarTela();
