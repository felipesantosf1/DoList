const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let pyProc = null;

function iniciarBackendPython() {

    const isPackaged = app.isPackaged;

    const apiPath = isPackaged
        ? path.join(process.resourcesPath, "backend", "dist", "run_api.exe")
        : path.join(__dirname, "..", "backend", "dist", "run_api.exe");

    console.log("Iniciando API Python em:", apiPath);

    // Define a pasta de trabalho do Python
    const backendDir = isPackaged
        ? path.join(process.resourcesPath, "backend")
        : path.join(__dirname, "..", "backend");

    // Executa o .exe do Python
    pyProc = spawn(apiPath, {
        cwd: backendDir
    });

    // Registra logs do Python no console do Electron
    pyProc.stdout.on("data", (data) => {
        console.log(`[Python Log]: ${data}`);
    });

    pyProc.stderr.on("data", (data) => {
        console.error(`[Python Erro]: ${data}`);
    });

    pyProc.on("error", (err) => {
        console.error("Falha ao iniciar a API Python:", err);
    });
}

// Função para fechar a API Python quando o app for encerrado
function encerrarBackendPython() {
    if (pyProc !== null) {
        console.log("Encerrando o servidor Python...");
        pyProc.kill();
        pyProc = null;
    }
}

function criarJanela() {
    const janela = new BrowserWindow({
        width: 400,
        height: 600,
        minWidth: 500,
        minHeight: 500,
        autoHideMenuBar: true,   // Esconde a barra nativa do Windows (Arquivo, Editar, etc) para ganhar espaço
        icon: path.join(__dirname, "..", "frontend", "img", "logo_V2.ico"),
        webPreferences: {
            contextIsolation: true
        }
    });

    janela.loadFile(path.join(__dirname, "..", "frontend", "index.html"));
}

app.whenReady().then(() => {
    iniciarBackendPython(); // Inicia a API Python antes de abrir a janela
    criarJanela();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            criarJanela();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Garante que a API Python é destruída assim que o Electron fechar
app.on("will-quit", () => {
    encerrarBackendPython();
});