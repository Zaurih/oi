
/* =====================================
   ORGANIZAÊ — JAVASCRIPT PRINCIPAL
   Sem Flask: HTML, CSS e JavaScript
===================================== */

const CHAVE_TAREFAS = "organizae_tarefas_v1";

const formTarefa = document.getElementById("formTarefa");
const campoTitulo = document.getElementById("titulo");
const campoMateria = document.getElementById("materia");
const campoTipo = document.getElementById("tipo");
const campoPrazo = document.getElementById("prazo");
const campoObservacoes = document.getElementById("observacoes");

const listaTarefas = document.getElementById("listaTarefas");
const campoFiltro = document.getElementById("filtro");
const campoAlertas = document.getElementById("alertas");

const campoTotal = document.getElementById("total");
const campoPendentes = document.getElementById("pendentes");
const campoConcluidas = document.getElementById("concluidas");

const gradeCalendario = document.getElementById("gradeCalendario");
const mesAno = document.getElementById("mesAno");
const mesAnterior = document.getElementById("mesAnterior");
const mesProximo = document.getElementById("mesProximo");
const tarefasDoDia = document.getElementById("tarefasDoDia");

let tarefas = carregarTarefas();

function carregarTarefas() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_TAREFAS) || "[]"
        );

        if (!Array.isArray(dados)) return [];

        return dados.map(tarefa => ({
            ...tarefa,
            id: tarefa.id ?? (
                globalThis.crypto?.randomUUID?.() ??
                `${Date.now()}-${Math.random()}`
            ),
            titulo: tarefa.titulo ?? tarefa.nome ?? "Atividade",
            materia: tarefa.materia ?? "",
            tipo: tarefa.tipo ?? "Outro",
            prazo: tarefa.prazo ?? "",
            observacoes: tarefa.observacoes ?? "",
            concluida: tarefa.concluida === true
        }));
    } catch (erro) {
        console.error("Erro ao carregar tarefas:", erro);
        return [];
    }
}

function salvarTarefas() {
    try {
        localStorage.setItem(
            CHAVE_TAREFAS,
            JSON.stringify(tarefas)
        );
        return true;
    } catch (erro) {
        console.error("Erro ao salvar tarefas:", erro);
        mostrarAlerta(
            "Não foi possível salvar. Verifique o armazenamento do navegador."
        );
        return false;
    }
}

function mostrarAlerta(mensagem) {
    if (!campoAlertas) return;

    campoAlertas.textContent = mensagem;
    campoAlertas.setAttribute("role", "status");
}

function formatarData(data) {
    if (!data) return "Sem data";

    const partes = data.split("-");
    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function dataLocalString(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

/* =====================================
   CADASTRAR TAREFAS
===================================== */

formTarefa.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const titulo = campoTitulo.value.trim();
    const materia = campoMateria.value.trim();
    const prazo = campoPrazo.value;

    if (!titulo || !materia || !prazo) {
        mostrarAlerta("Preencha o nome, a matéria e a data de entrega.");
        return;
    }

    const novaTarefa = {
        id: globalThis.crypto?.randomUUID?.() ??
            `${Date.now()}-${Math.random()}`,
        titulo,
        materia,
        tipo: campoTipo.value,
        prazo,
        observacoes: campoObservacoes.value.trim(),
        concluida: false
    };

    tarefas.push(novaTarefa);

    if (!salvarTarefas()) {
        tarefas.pop();
        return;
    }

    formTarefa.reset();

    mostrarAlerta("Atividade salva com sucesso!");

    atualizarInterface();
});

/* =====================================
   EXIBIR E FILTRAR TAREFAS
===================================== */

function renderizarTarefas() {
    if (!listaTarefas) return;

    listaTarefas.replaceChildren();

    const filtro = campoFiltro.value;

    const tarefasFiltradas = tarefas.filter(tarefa => {
        if (filtro === "pendentes") return !tarefa.concluida;
        if (filtro === "concluidas") return tarefa.concluida;
        return true;
    });

    if (tarefasFiltradas.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.className = "mensagem-vazia";
        mensagem.textContent =
            filtro === "concluidas"
                ? "Você ainda não concluiu nenhuma atividade."
                : filtro === "pendentes"
                    ? "Você não tem atividades pendentes."
                    : "Nenhuma atividade cadastrada ainda.";

        listaTarefas.appendChild(mensagem);
        return;
    }

    tarefasFiltradas.sort((a, b) => {
        if (a.concluida !== b.concluida) {
            return Number(a.concluida) - Number(b.concluida);
        }

        return (a.prazo || "").localeCompare(b.prazo || "");
    });

    tarefasFiltradas.forEach(tarefa => {
        const cartao = document.createElement("article");
        cartao.className = "tarefa";

        if (tarefa.concluida) {
            cartao.classList.add("tarefa-concluida");
        }

        const titulo = document.createElement("h3");
        titulo.className = "texto-tarefa";
        titulo.textContent = tarefa.titulo;

        const materia = document.createElement("p");
        materia.className = "detalhes-tarefa";
        materia.textContent = `Matéria: ${tarefa.materia}`;

        const tipo = document.createElement("p");
        tipo.className = "detalhes-tarefa";
        tipo.textContent = `Tipo: ${tarefa.tipo}`;

        const prazo = document.createElement("p");
        prazo.className = "detalhes-tarefa";
        prazo.textContent = `Entrega: ${formatarData(tarefa.prazo)}`;

        cartao.append(titulo, materia, tipo, prazo);

        if (tarefa.observacoes) {
            const observacoes = document.createElement("p");
            observacoes.className = "detalhes-tarefa";
            observacoes.textContent =
                `Observações: ${tarefa.observacoes}`;

            cartao.appendChild(observacoes);
        }

        const status = document.createElement("p");
        status.className = "detalhes-tarefa";
        status.textContent = tarefa.concluida
            ? "Status: Concluída"
            : "Status: Pendente";

        cartao.appendChild(status);

        const acoes = document.createElement("div");
        acoes.className = "acoes-tarefa";

        const botaoConcluir = document.createElement("button");
        botaoConcluir.type = "button";
        botaoConcluir.className = "btn-concluir";
        botaoConcluir.textContent = tarefa.concluida
            ? "Desfazer conclusão"
            : "✓ Concluir";

        botaoConcluir.addEventListener("click", () => {
            alternarConclusao(tarefa.id);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "btn-excluir";
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", () => {
            excluirTarefa(tarefa.id);
        });

        acoes.append(botaoConcluir, botaoExcluir);
        cartao.appendChild(acoes);

        listaTarefas.appendChild(cartao);
    });
}

function alternarConclusao(id) {
    const tarefa = tarefas.find(
        item => String(item.id) === String(id)
    );

    if (!tarefa) return;

    tarefa.concluida = !tarefa.concluida;

    if (!salvarTarefas()) {
        tarefa.concluida = !tarefa.concluida;
        return;
    }

    mostrarAlerta(
        tarefa.concluida
            ? "Atividade marcada como concluída!"
            : "Atividade voltou para pendente."
    );

    atualizarInterface();
}

function excluirTarefa(id) {
    const indice = tarefas.findIndex(
        item => String(item.id) === String(id)
    );

    if (indice === -1) return;

    const tarefaRemovida = tarefas.splice(indice, 1)[0];

    if (!salvarTarefas()) {
        tarefas.splice(indice, 0, tarefaRemovida);
        return;
    }

    mostrarAlerta("Atividade excluída.");
    atualizarInterface();
}

campoFiltro.addEventListener("change", renderizarTarefas);

/* =====================================
   ESTATÍSTICAS
===================================== */

function atualizarEstatisticas() {
    const total = tarefas.length;
    const concluidas = tarefas.filter(
        tarefa => tarefa.concluida
    ).length;

    const pendentes = total - concluidas;

    campoTotal.textContent = total;
    campoPendentes.textContent = pendentes;
    campoConcluidas.textContent = concluidas;
}

/* =====================================
   CALENDÁRIO
===================================== */

let dataCalendario = new Date();
let diaEscolhido = dataLocalString(new Date());

function desenharCalendario() {
    if (!gradeCalendario || !mesAno) return;

    const ano = dataCalendario.getFullYear();
    const mes = dataCalendario.getMonth();

    mesAno.textContent = dataCalendario.toLocaleDateString(
        "pt-BR",
        { month: "long", year: "numeric" }
    );

    gradeCalendario.replaceChildren();

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const deslocamento = (primeiroDia + 6) % 7;
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const hoje = dataLocalString(new Date());

    for (let i = 0; i < deslocamento; i++) {
        const vazio = document.createElement("div");
        vazio.className = "dia-calendario vazio";
        vazio.setAttribute("aria-hidden", "true");
        gradeCalendario.appendChild(vazio);
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        const data = new Date(ano, mes, dia);
        const dataISO = dataLocalString(data);

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "dia-calendario";
        botao.textContent = dia;
        botao.setAttribute(
            "aria-label",
            `${dia} de ${data.toLocaleDateString("pt-BR", {
                month: "long"
            })}`
        );

        if (dataISO === hoje) {
            botao.classList.add("hoje");
        }

        if (dataISO === diaEscolhido) {
            botao.classList.add("selecionado");
            botao.setAttribute("aria-pressed", "true");
        }

        const temTarefas = tarefas.some(
            tarefa => tarefa.prazo === dataISO
        );

        if (temTarefas) {
            botao.classList.add("tem-tarefas");
            botao.title = "Há atividades para este dia";
        }

        botao.addEventListener("click", () => {
            diaEscolhido = dataISO;
            desenharCalendario();
            mostrarTarefasDoDia();
        });

        gradeCalendario.appendChild(botao);
    }

    mostrarTarefasDoDia();
}

function mostrarTarefasDoDia() {
    if (!tarefasDoDia) return;

    tarefasDoDia.replaceChildren();

    const titulo = document.createElement("h3");
    titulo.textContent = `Atividades de ${formatarData(diaEscolhido)}`;
    tarefasDoDia.appendChild(titulo);

    const doDia = tarefas.filter(
        tarefa => tarefa.prazo === diaEscolhido
    );

    if (doDia.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhuma atividade para este dia.";
        tarefasDoDia.appendChild(mensagem);
        return;
    }

    const lista = document.createElement("ul");

    doDia.forEach(tarefa => {
        const item = document.createElement("li");

        item.textContent =
            `${tarefa.concluida ? "✓" : "○"} ${tarefa.titulo} — ` +
            `${tarefa.materia} (${tarefa.concluida ? "Concluída" : "Pendente"})`;

        lista.appendChild(item);
    });

    tarefasDoDia.appendChild(lista);
}

mesAnterior.addEventListener("click", () => {
    dataCalendario = new Date(
        dataCalendario.getFullYear(),
        dataCalendario.getMonth() - 1,
        1
    );

    desenharCalendario();
});

mesProximo.addEventListener("click", () => {
    dataCalendario = new Date(
        dataCalendario.getFullYear(),
        dataCalendario.getMonth() + 1,
        1
    );

    desenharCalendario();
});

/* =====================================
   TEMPORIZADOR POMODORO
===================================== */

const relogioFoco = document.getElementById("relogioFoco");
const estadoFoco = document.getElementById("estadoFoco");
const progressoFoco = document.getElementById("progressoFoco");

const modoFoco = document.getElementById("modoFoco");
const modoPausa = document.getElementById("modoPausa");
const iniciarFoco = document.getElementById("iniciarFoco");
const reiniciarFoco = document.getElementById("reiniciarFoco");

const DURACAO_FOCO = 25 * 60;
const DURACAO_PAUSA = 5 * 60;

let duracaoAtual = DURACAO_FOCO;
let segundosRestantes = DURACAO_FOCO;
let intervaloFoco = null;
let fimDoTemporizador = 0;

function atualizarRelogio() {
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;

    relogioFoco.textContent =
        `${String(minutos).padStart(2, "0")}:` +
        `${String(segundos).padStart(2, "0")}`;

    const decorrido = duracaoAtual - segundosRestantes;
    const porcentagem = duracaoAtual > 0
        ? (decorrido / duracaoAtual) * 100
        : 0;

    progressoFoco.style.width = `${porcentagem}%`;
}

function pararTemporizador() {
    if (intervaloFoco !== null) {
        clearInterval(intervaloFoco);
        intervaloFoco = null;
    }

    iniciarFoco.textContent = "▶ Continuar";
}

function pausarTemporizador() {
    if (intervaloFoco === null) return;

    segundosRestantes = Math.max(
        0,
        Math.ceil((fimDoTemporizador - Date.now()) / 1000)
    );

    pararTemporizador();
    atualizarRelogio();
    estadoFoco.textContent = "Temporizador pausado.";
}

function marcarModo(modo) {
    const focoAtivo = modo === "foco";

    modoFoco.classList.toggle("ativo", focoAtivo);
    modoPausa.classList.toggle("ativo", !focoAtivo);
}

function selecionarModo(modo) {
    pararTemporizador();

    duracaoAtual = modo === "foco"
        ? DURACAO_FOCO
        : DURACAO_PAUSA;

    segundosRestantes = duracaoAtual;

    marcarModo(modo);
    iniciarFoco.textContent = "▶ Iniciar";
    estadoFoco.textContent = modo === "foco"
        ? "Pronta para começar?"
        : "Hora de fazer uma pausa.";

    atualizarRelogio();
}

function iniciarTemporizador() {
    if (intervaloFoco !== null) {
        pausarTemporizador();
        return;
    }

    if (segundosRestantes <= 0) {
        segundosRestantes = duracaoAtual;
    }

    fimDoTemporizador = Date.now() + segundosRestantes * 1000;
    iniciarFoco.textContent = "Ⅱ Pausar";
    estadoFoco.textContent = "Tempo em andamento. Mantenha o foco!";

    intervaloFoco = setInterval(() => {
        segundosRestantes = Math.max(
            0,
            Math.ceil((fimDoTemporizador - Date.now()) / 1000)
        );

        atualizarRelogio();

        if (segundosRestantes <= 0) {
            pararTemporizador();
            estadoFoco.textContent = duracaoAtual === DURACAO_FOCO
                ? "Sessão concluída! Hora de descansar."
                : "Pausa concluída! Você pode voltar aos estudos.";

            iniciarFoco.textContent = "▶ Iniciar";
        }
    }, 250);
}

modoFoco.addEventListener("click", () => selecionarModo("foco"));
modoPausa.addEventListener("click", () => selecionarModo("pausa"));
iniciarFoco.addEventListener("click", iniciarTemporizador);

reiniciarFoco.addEventListener("click", () => {
    pararTemporizador();
    segundosRestantes = duracaoAtual;
    atualizarRelogio();

    iniciarFoco.textContent = "▶ Iniciar";
    estadoFoco.textContent = "Temporizador reiniciado.";
});

/* =====================================
   ATUALIZAÇÃO GERAL
===================================== */

function atualizarInterface() {
    renderizarTarefas();
    atualizarEstatisticas();
    desenharCalendario();
}

const anoRodape = document.getElementById("ano");

if (anoRodape) {
    anoRodape.textContent = new Date().getFullYear();
}

atualizarInterface();
atualizarRelogio();


const META_ANUAL = 18;
const MEDIA_TRIMESTRAL = 6;
const TOTAL_TRIMESTRES = 3;
const NOTA_MAXIMA = 10;

let boletim = JSON.parse(
    localStorage.getItem("organizae_notas_v1") || "[]"
);

const formNota = document.getElementById("formNota");
const nomeMateriaNota = document.getElementById("nomeMateriaNota");
const bimestreNota = document.getElementById("bimestreNota");
const valorNota = document.getElementById("valorNota");
const listaNotas = document.getElementById("listaNotas");
const mensagemNota = document.getElementById("mensagemNota");

function salvarBoletim() {
    localStorage.setItem(
        "organizae_notas_v1",
        JSON.stringify(boletim)
    );
}

function calcularSituacao(materia) {
    const notasRegistradas = materia.notas
        .filter(nota => nota !== null && nota !== undefined);

    const soma = notasRegistradas.reduce(
        (total, nota) => total + nota,
        0
    );

    const trimestresRestantes =
        TOTAL_TRIMESTRES - notasRegistradas.length;

    const pontosFaltantes = Math.max(0, META_ANUAL - soma);

    let mediaAtual = notasRegistradas.length
        ? soma / notasRegistradas.length
        : 0;

    let notaNecessaria = null;

    if (trimestresRestantes > 0) {
        notaNecessaria = pontosFaltantes / trimestresRestantes;
    }

    let situacao = "";

    if (notasRegistradas.length === 0) {
        situacao = "Adicione as notas dos trimestres.";
    } else if (notasRegistradas.length < TOTAL_TRIMESTRES) {
        if (notaNecessaria > NOTA_MAXIMA) {
            situacao = "Não é possível atingir 18 pontos apenas com as notas restantes.";
        } else if (notaNecessaria > NOTA_MAXIMA) {
            situacao = "A nota necessária ultrapassa o máximo permitido.";
        } else {
            situacao = `Você precisa de ${notaNecessaria.toFixed(1)} ponto(s) em média nos trimestres restantes.`;
        }
    } else if (soma >= META_ANUAL) {
        situacao = "Meta anual atingida!";
    } else {
        situacao = `Faltaram ${(META_ANUAL - soma).toFixed(1)} ponto(s) para atingir 18,0.`;
    }

    return {
        soma,
        mediaAtual,
        trimestresRestantes,
        pontosFaltantes,
        notaNecessaria,
        situacao
    };
}

function renderizarNotas() {
    if (!listaNotas) return;

    listaNotas.innerHTML = "";

    if (boletim.length === 0) {
        listaNotas.innerHTML =
            "<p>Você ainda não adicionou nenhuma matéria.</p>";
        return;
    }

    boletim.forEach((materia, indice) => {
        const situacao = calcularSituacao(materia);

        const notasHTML = materia.notas.map((nota, trimestre) => `
            <div class="nota-bimestre">
                <span>${trimestre + 1}º trimestre</span>
                <strong>${nota === null ? "—" : nota.toFixed(1)}</strong>
            </div>
        `).join("");

        const card = document.createElement("article");
        card.className = "card-nota";

        card.innerHTML = `
            <h3>${escaparHTML(materia.nome)}</h3>

            <div class="notas-bimestres">
                ${notasHTML}
            </div>

            <div class="resumo-nota">
                <p>
                    <strong>Pontos acumulados:</strong>
                    ${situacao.soma.toFixed(1)} / 18,0
                </p>

                <p>
                    <strong>Média das notas lançadas:</strong>
                    ${situacao.mediaAtual.toFixed(1)}
                </p>

                <p>
                    <strong>Pontos que faltam:</strong>
                    ${situacao.pontosFaltantes.toFixed(1)}
                </p>

                <p class="status-nota">
                    ${escaparHTML(situacao.situacao)}
                </p>
            </div>

            <button
                type="button"
                class="botao-remover-nota"
                data-remover="${indice}"
            >
                Excluir matéria
            </button>
        `;

        listaNotas.appendChild(card);
    });
}

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

if (formNota) {
    formNota.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const nome = nomeMateriaNota.value.trim();
        const trimestre = Number(bimestreNota.value);
        const nota = Number(valorNota.value);

        if (!nome) {
            mensagemNota.textContent = "Digite o nome da matéria.";
            return;
        }

        if (
            !Number.isInteger(trimestre) ||
            trimestre < 1 ||
            trimestre > TOTAL_TRIMESTRES
        ) {
            mensagemNota.textContent =
                "Selecione um trimestre válido.";
            return;
        }

        if (!Number.isFinite(nota) || nota < 0 || nota > NOTA_MAXIMA) {
            mensagemNota.textContent =
                "Digite uma nota entre 0 e 10.";
            return;
        }

        let materia = boletim.find(
            item => item.nome.toLowerCase() === nome.toLowerCase()
        );

        if (!materia) {
            materia = {
                nome,
                notas: [null, null, null]
            };

            boletim.push(materia);
        }

        materia.notas[trimestre - 1] = nota;

        salvarBoletim();
        renderizarNotas();

        mensagemNota.textContent =
            `Nota do ${trimestre}º trimestre salva!`;

        valorNota.value = "";
        nomeMateriaNota.value = "";
        nomeMateriaNota.focus();
    });
}

if (listaNotas) {
    listaNotas.addEventListener("click", function(evento) {
        const botao = evento.target.closest("[data-remover]");

        if (!botao) return;

        const indice = Number(botao.dataset.remover);

        if (!Number.isInteger(indice) || !boletim[indice]) return;

        boletim.splice(indice, 1);

        salvarBoletim();
        renderizarNotas();
    });
}

renderizarNotas();
