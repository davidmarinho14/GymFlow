(() => {
  'use strict';

  const API = '/api/treinos';
  const $ = id => document.getElementById(id);

  const form = $('treino-form');
  const lista = $('lista');
  const vazio = $('vazio');
  const resumo = $('resumo');
  const erroEl = $('form-error');
  const toastEl = $('toast');
  const btnSalvar = $('btn-salvar');
  const btnCancelar = $('btn-cancelar');

  let treinos = [];
  let filtro = 'todos';
  let toastTimer;

  async function request(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (res.status === 204) return null;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.erro || 'Não foi possível concluir a ação.');
    return body;
  }

  function toast(msg, isError = false) {
    toastEl.textContent = msg;
    toastEl.classList.toggle('is-error', isError);
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2800);
  }

  function showFormError(msg) {
    erroEl.textContent = msg || '';
    erroEl.hidden = !msg;
  }

  // Usa textContent (nunca innerHTML) para evitar XSS com dados vindos da API.
  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    children.forEach(c => node.append(c));
    return node;
  }

  function render() {
    const visiveis = treinos.filter(t =>
      filtro === 'todos' ? true : filtro === 'concluidos' ? t.concluido : !t.concluido);

    lista.replaceChildren(...visiveis.map(renderItem));
    vazio.hidden = visiveis.length > 0;
    vazio.textContent = treinos.length
      ? 'Nenhum treino neste filtro.'
      : 'Nenhum treino por aqui ainda. Cadastre o primeiro!';

    const feitos = treinos.filter(t => t.concluido).length;
    resumo.textContent = treinos.length
      ? `${feitos} de ${treinos.length} treino(s) concluído(s)`
      : '';
  }

  function renderItem(t) {
    const check = el('input', {
      type: 'checkbox', class: 'check',
      'aria-label': `Marcar "${t.nome}" como concluído`,
      onchange: e => toggleConcluido(t.id, e.target.checked),
    });
    check.checked = t.concluido;

    return el('li', { class: 'item' + (t.concluido ? ' is-done' : '') },
      check,
      el('div', {},
        el('div', { class: 'item__nome' }, t.nome),
        el('div', { class: 'item__meta' },
          el('span', { class: 'tag' }, t.grupoMuscular),
          el('span', {}, `${t.series} × ${t.repeticoes}`))),
      el('div', { class: 'item__actions' },
        el('button', { type: 'button', class: 'btn btn--sm', onclick: () => iniciarEdicao(t) }, 'Editar'),
        el('button', { type: 'button', class: 'btn btn--sm btn--danger', onclick: () => excluir(t) }, 'Excluir')));
  }

  async function carregar() {
    try {
      treinos = await request(API);
      render();
    } catch (err) {
      toast(err.message, true);
    }
  }

  function lerFormulario() {
    return {
      nome: $('nome').value.trim(),
      grupoMuscular: $('grupoMuscular').value,
      series: Number($('series').value),
      repeticoes: Number($('repeticoes').value),
    };
  }

  function validar(d) {
    if (!d.nome) return 'Informe o nome do exercício.';
    if (!d.grupoMuscular) return 'Selecione o grupo muscular.';
    if (!Number.isInteger(d.series) || d.series < 1 || d.series > 100) return 'Séries deve ser um inteiro entre 1 e 100.';
    if (!Number.isInteger(d.repeticoes) || d.repeticoes < 1 || d.repeticoes > 1000) return 'Repetições deve ser um inteiro entre 1 e 1000.';
    return '';
  }

  function limparFormulario() {
    form.reset();
    $('treino-id').value = '';
    $('series').value = 3;
    $('repeticoes').value = 12;
    $('form-title').textContent = 'Novo treino';
    btnSalvar.textContent = 'Cadastrar treino';
    btnCancelar.hidden = true;
    showFormError('');
  }

  function iniciarEdicao(t) {
    $('treino-id').value = t.id;
    $('nome').value = t.nome;
    // Garante que o grupo exista como opção, mesmo se veio de outro cliente.
    const sel = $('grupoMuscular');
    if (![...sel.options].some(o => o.value === t.grupoMuscular)) {
      sel.append(el('option', {}, t.grupoMuscular));
    }
    sel.value = t.grupoMuscular;
    $('series').value = t.series;
    $('repeticoes').value = t.repeticoes;
    $('form-title').textContent = 'Editar treino';
    btnSalvar.textContent = 'Salvar alterações';
    btnCancelar.hidden = false;
    showFormError('');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('nome').focus();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const dados = lerFormulario();
    const msg = validar(dados);
    if (msg) return showFormError(msg);
    showFormError('');

    const id = $('treino-id').value;
    btnSalvar.disabled = true;
    try {
      if (id) {
        await request(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
        toast('Treino atualizado!');
      } else {
        await request(API, { method: 'POST', body: JSON.stringify(dados) });
        toast('Treino cadastrado!');
      }
      limparFormulario();
      await carregar();
    } catch (err) {
      showFormError(err.message);
    } finally {
      btnSalvar.disabled = false;
    }
  });

  btnCancelar.addEventListener('click', limparFormulario);

  async function excluir(t) {
    if (!confirm(`Excluir o treino "${t.nome}"?`)) return;
    try {
      await request(`${API}/${t.id}`, { method: 'DELETE' });
      if (Number($('treino-id').value) === t.id) limparFormulario();
      toast('Treino excluído.');
      await carregar();
    } catch (err) {
      toast(err.message, true);
    }
  }

  async function toggleConcluido(id, concluido) {
    try {
      await request(`${API}/${id}/concluir`, { method: 'PATCH', body: JSON.stringify({ concluido }) });
      await carregar();
    } catch (err) {
      toast(err.message, true);
      await carregar();
    }
  }

  document.querySelectorAll('.chip').forEach(btn =>
    btn.addEventListener('click', () => {
      filtro = btn.dataset.filtro;
      document.querySelectorAll('.chip').forEach(b => b.classList.toggle('is-active', b === btn));
      render();
    }));

  // ---------- Biblioteca de exercícios (Wger via /api/exercicios) ----------
  const API_EXERCICIOS = '/api/exercicios?limit=20';
  const IDIOMA_PT = 7; // ids de idioma da Wger
  const IDIOMA_EN = 2;

  // Categorias da Wger (em inglês) -> rótulo em português exibido no card.
  const ROTULOS = {
    Abs: 'Abdômen', Arms: 'Braços', Back: 'Costas', Calves: 'Panturrilha',
    Cardio: 'Cardio', Chest: 'Peito', Legs: 'Pernas', Shoulders: 'Ombros',
  };
  // Categoria -> grupo do formulário. "Arms" fica de fora: pode ser bíceps ou tríceps.
  const GRUPO_FORM = {
    Abs: 'Abdômen', Back: 'Costas', Calves: 'Pernas', Cardio: 'Cardio',
    Chest: 'Peito', Legs: 'Pernas', Shoulders: 'Ombros',
  };

  const bibStatus = $('biblioteca-status');
  const bibLista = $('biblioteca-lista');
  const bibCredito = $('biblioteca-credito');
  const bibRecarregar = $('biblioteca-recarregar');

  // Nome em português; se não houver, inglês; se não houver, a primeira tradução.
  function nomeDoExercicio(ex) {
    const traducoes = (ex.translations || []).filter(t => t && typeof t.name === 'string' && t.name.trim());
    const idioma = t => (t.language && typeof t.language === 'object' ? t.language.id : t.language);
    const achado = traducoes.find(t => idioma(t) === IDIOMA_PT)
      || traducoes.find(t => idioma(t) === IDIOMA_EN)
      || traducoes[0];
    return achado ? achado.name.trim() : '';
  }

  function usarNoFormulario(nome, categoria) {
    $('nome').value = nome.slice(0, 120);
    if (GRUPO_FORM[categoria]) $('grupoMuscular').value = GRUPO_FORM[categoria];
    showFormError('');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('nome').focus();
    toast('Nome preenchido no formulário.');
  }

  function renderExercicio(ex) {
    const nome = nomeDoExercicio(ex);
    if (!nome) return null;
    const categoria = ex.category && ex.category.name;
    const rotulo = categoria ? (ROTULOS[categoria] || categoria) : '';
    return el('li', { class: 'biblioteca__item' },
      el('div', {},
        el('div', { class: 'biblioteca__nome' }, nome),
        rotulo ? el('div', { class: 'biblioteca__meta' }, rotulo) : ''),
      el('button', {
        type: 'button', class: 'btn btn--sm',
        'aria-label': `Usar "${nome}" no formulário`,
        onclick: () => usarNoFormulario(nome, categoria),
      }, 'Usar no formulário'));
  }

  function statusBiblioteca(msg, isError = false) {
    bibStatus.textContent = msg;
    bibStatus.classList.toggle('is-error', isError);
    bibStatus.hidden = !msg;
  }

  async function carregarBiblioteca() {
    bibRecarregar.disabled = true;
    bibLista.hidden = true;
    bibCredito.hidden = true;
    statusBiblioteca('Carregando exercícios…');
    try {
      const dados = await request(API_EXERCICIOS);
      const itens = (dados.results || []).map(renderExercicio).filter(Boolean);
      if (!itens.length) {
        statusBiblioteca('Nenhum exercício disponível no momento.');
        return;
      }
      bibLista.replaceChildren(...itens);
      bibLista.hidden = false;
      bibCredito.hidden = false;
      statusBiblioteca('');
    } catch (err) {
      statusBiblioteca('Não foi possível carregar a biblioteca de exercícios agora. Tente novamente em instantes.', true);
    } finally {
      bibRecarregar.disabled = false;
    }
  }

  bibRecarregar.addEventListener('click', carregarBiblioteca);

  carregar();
  carregarBiblioteca();
})();
