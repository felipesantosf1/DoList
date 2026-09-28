const { app, BrowserWindow } = require("electron");
const path = require("path");

function criarJanela() {
    const janela = new BrowserWindow({
        width: 1200,
        height: 800,

        webPreferences: {
            contextIsolation: true
        }
    });

    // Abre o HTML do frontend
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