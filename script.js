// LISTA DE USUÁRIOS
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

// ABRIR MODAL
function abrirCadastro() {
    document.getElementById("modal-cadastro").style.display = "flex";
}

// FECHAR MODAL
function fecharCadastro() {
    document.getElementById("modal-cadastro").style.display = "none";
}

// CADASTRAR
function cadastrar() {

    const usuario = document.getElementById("novoUsuario").value;
    const senha = document.getElementById("novaSenha").value;

    if(usuario === "" || senha === "") {
        alert("Preencha todos os campos");
        return;
    }

    // VERIFICA SE JÁ EXISTE
    const existe = usuarios.find(u => u.usuario === usuario);

    if(existe) {
        alert("Usuário já cadastrado");
        return;
    }

    usuarios.push({
        usuario,
        senha
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Cadastro realizado com sucesso!");

    fecharCadastro();
}

function entrar() {

    const tipo = document.getElementById("tipoUsuario").value;
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    // LOGIN ADMIN
    if(tipo === "admin") {

        if(usuario === "admin" && senha === "123") {

            localStorage.setItem("logado", "true");
            localStorage.setItem("tipoUsuario", "admin");

            window.location.href = "index.html";

        } else {
            alert("Login de administrador inválido");
        }
    }

    // LOGIN CLIENTE
    else {

        if(usuario !== "" && senha !== "") {

            localStorage.setItem("logado", "true");
            localStorage.setItem("tipoUsuario", "cliente");
            localStorage.setItem("clienteNome", usuario);

            window.location.href = "index.html";

        } else {
            alert("Preencha os campos");
        }
    }
}

//semana passada

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

            // ADMIN
            if(tipoUsuario === "admin") {

                resultadosLivros.innerHTML += `
                    <div class="livro">

                        <img src="${capa}">

                        <div class="livro-info">

                            <h3>${titulo}</h3>

                            <p>${autor}</p>

                            <select id="cliente-${index}">
                                <option value="">
                                    Selecione um cliente
                                </option>

                                ${clientes.map(cliente => `
                                    <option value="${cliente.nome}">
                                        ${cliente.nome}
                                    </option>
                                `).join("")}

                            </select>

                            <button onclick="
                                finalizarEmprestimo(
                                    '${titulo}',
                                    '${capa}',
                                    '${index}'
                                )
                            ">
                                Finalizar Empréstimo
                            </button>

                        </div>

                    </div>
                `;
            }

            // CLIENTE
            else {

                resultadosLivros.innerHTML += `
                    <div class="livro">

                        <img src="${capa}">

                        <div class="livro-info">

                            <h3>${titulo}</h3>

                            <p>${autor}</p>

                            <button onclick="
                                emprestarLivroCliente(
                                    '${titulo}',
                                    '${capa}'
                                )
                            ">
                                Pegar Emprestado
                            </button>

                        </div>

                    </div>
                `;
            }
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

function emprestarLivroCliente(
    titulo,
    capa
) {

    const cliente =
        localStorage.getItem("clienteNome");

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

    renderEmprestimosCliente();

    alert("Livro emprestado!");
}

function renderEmprestimosCliente() {

    if(!listaEmprestimos) return;

    listaEmprestimos.innerHTML =
        "<h2>Meus Empréstimos</h2>";

    const cliente =
        localStorage.getItem("clienteNome");

    emprestimos.forEach(item => {

        if(item.cliente === cliente) {

            listaEmprestimos.innerHTML += `
                <div class="emprestimo">

                    <img src="${item.capa}">

                    <div>

                        <h3>${item.titulo}</h3>

                        <p>
                            <strong>Devolver até:</strong>
                            ${item.devolucao}
                        </p>

                    </div>

                </div>
            `;
        }
    });
}

// NAVEGAÇÃO ENTRE SEÇÕES

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

// CONTROLE DE LOGIN

const tipoUsuario =
    localStorage.getItem("tipoUsuario");

const nomeCliente =
    localStorage.getItem("clienteNome");

// VERIFICA LOGIN
if (
    window.location.pathname.includes("index.html")
) {

    if(localStorage.getItem("logado") !== "true") {
        window.location.href = "login.html";
    }
}

const areaAdmin =
    document.getElementById("area-admin");

const areaCliente =
    document.getElementById("area-cliente");

// ESCONDE OS DOIS PRIMEIRO
if(areaAdmin){
    areaAdmin.style.display = "none";
}

if(areaCliente){
    areaCliente.style.display = "none";
}

// MOSTRA O CERTO
if(tipoUsuario === "admin"){

    if(areaAdmin){
        areaAdmin.style.display = "flex";
    }

}else if(tipoUsuario === "cliente"){

    if(areaCliente){
        areaCliente.style.display = "flex";
    }
}

if(cadastroCliente){
    renderClientes();
}

if(tipoUsuario === "admin") {

    renderEmprestimos();

} else if(tipoUsuario === "cliente") {

    renderEmprestimosCliente();
}

// BOAS VINDAS

const areaClienteTexto =
    document.getElementById("boas-vindas");

if(areaClienteTexto && nomeCliente) {

    areaClienteTexto.innerHTML += `
        <p style="
            margin-top:20px;
            font-size:18px;
        ">
            Bem-vindo, ${nomeCliente}!
        </p>
    `;
}

// LOGOUT

function logout() {

    localStorage.removeItem("logado");
    localStorage.removeItem("tipoUsuario");
    localStorage.removeItem("clienteNome");

    window.location.href = "login.html";
}





