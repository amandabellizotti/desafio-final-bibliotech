
// LOCAL STORAGE
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let emprestimos = JSON.parse(localStorage.getItem("emprestimos")) || [];

let livroSelecionado = null;

// ELEMENTOS
const cadastroCliente = document.getElementById("cadastro-cliente");
const listaClientes = document.getElementById("listaClientes");

const botaoBuscar = document.getElementById("botao-buscar");
const buscaLivro = document.getElementById("busca-livro");

const resultadosLivros = document.getElementById("listaLivros");
const listaEmprestimos = document.getElementById("listaEmprestimos");

const loading = document.getElementById("loading");


// CLIENTES
cadastroCliente.addEventListener("submit", (e) => {

    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const email = document.getElementById("email").value;

    // VALIDAÇÃO
    if (!nome || !cpf || !email) {
        alert("Preencha todos os campos");
        return;
    }

    const novoCliente = {
        id: Date.now(),
        nome,
        cpf,
        email
    };

    clientes.push(novoCliente);

    localStorage.setItem(
        "clientes",
        JSON.stringify(clientes)
    );

    renderClientes();

    cadastroCliente.reset();
});

// MOSTRAR CLIENTES

function renderClientes() {

    listaClientes.innerHTML = "";

    clientes.forEach(cliente => {

        listaClientes.innerHTML += `
      <div class="cliente">
        <h3>${cliente.nome}</h3>
        <p>${cliente.email}</p>
      </div>
    `;
    });
}


// API LIVROS
botaoBuscar.addEventListener("click", buscarLivros);

async function buscarLivros() {

    const termo = buscaLivro.value;

    if (!termo) {
        alert("Digite um livro");
        return;
    }

    loading.innerText = "Carregando...";

    resultadosLivros.innerHTML = "";

    try {

        const resposta = await fetch(
            `https://openlibrary.org/search.json?q=${termo}`
        );

        const dados = await resposta.json();

        loading.innerText = "";

        if (dados.docs.length === 0) {
            resultadosLivros.innerHTML =
                "<p>Nenhum livro encontrado</p>";
            return;
        }

        dados.docs.slice(0, 5).forEach((livro, index) => {

            const titulo = livro.title || "Sem título";

            const autor = livro.author_name
                ? livro.author_name[0]
                : "Autor desconhecido";

            const capa = livro.cover_i
                ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`
                : "https://via.placeholder.com/100";

            resultadosLivros.innerHTML += `
        <div class="livro">

          <img src="${capa}">

          <h3>${titulo}</h3>

          <p>${autor}</p>

          <select id="cliente-${index}">
            <option value="">Selecione um cliente</option>

            ${clientes.map(cliente => `
              <option value="${cliente.nome}">
                ${cliente.nome}
              </option>
            `).join("")}

          </select>

          <button onclick="finalizarEmprestimo(
            '${titulo}',
            '${capa}',
            '${index}'
          )">
            Finalizar Empréstimo
          </button>

        </div>
      `;
        });

    } catch (error) {

        loading.innerText = "";

        resultadosLivros.innerHTML =
            "<p>Erro ao buscar livros</p>";

        console.log(error);
    }
}


// EMPRÉSTIMOS
function finalizarEmprestimo(
    titulo,
    capa,
    chave
) {

    const select = document.getElementById(`cliente-${chave}`);

    const cliente = select.value;

    if (!cliente) {
        alert("Selecione um cliente");
        return;
    }

    const hoje = new Date();

    hoje.setDate(hoje.getDate() + 7);

    const devolucao =
        hoje.toLocaleDateString("pt-BR");

    const emprestimo = {
        cliente,
        titulo,
        capa,
        devolucao
    };

    emprestimos.push(emprestimo);

    localStorage.setItem(
        "emprestimos",
        JSON.stringify(emprestimos)
    );

    renderEmprestimos();

    alert("Empréstimo realizado!");
}

// MOSTRAR EMPRÉSTIMOS

function renderEmprestimos() {

    listaEmprestimos.innerHTML = "";

    emprestimos.forEach(item => {

        listaEmprestimos.innerHTML += `
      <div class="emprestimo">

        <img src="${item.capa}">

        <h3>${item.titulo}</h3>

        <p><strong>Cliente:</strong>
        ${item.cliente}</p>

        <p><strong>Devolver até:</strong>
        ${item.devolucao}</p>

      </div>
    `;
    });
}



renderClientes();
renderEmprestimos();


// ==========================
// NAVEGAÇÃO ENTRE SEÇÕES
// ==========================

function mostrarSecao(secaoId) {

    // ESCONDE O TEXTO DE BOAS-VINDAS 
    document.getElementById("boas-vindas").style.display = "none";

    const secoes =
        document.querySelectorAll(".secao");

    secoes.forEach(secao => {
        secao.style.display = "none";
    });

    document.getElementById(secaoId)
        .style.display = "block";
}

// COMEÇA MOSTRANDO LIVROS





