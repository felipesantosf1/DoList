const { app, BrowserWindow } = require("electron");
const path = require("path");

function criarJanela() {
    const janela = new BrowserWindow({
        width: 400,
        height: 600,
        minWidth: 500,
        minHeight: 500,
        alwaysOnTop: true,       // Mantém a janela sempre visível enquanto você programa ou projeta
        autoHideMenuBar: true,   // Esconde a barra nativa do Windows (Arquivo, Editar, etc) para ganhar espaço
        webPreferences: {
            contextIsolation: true
        }
    });

    janela.loadFile(path.join(__dirname, "..", "frontend", "index.html"));
}

app.whenReady().then(() => {
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