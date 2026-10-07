# RootTask ⚙️

Um aplicativo desktop para gerenciamento de tarefas. O projeto utiliza uma arquitetura híbrida, unindo o ecossistema Node.js para a interface nativa com o Python para o processamento de backend e banco de dados.

## Arquitetura e Tecnologias

Diferente de aplicativos Electron convencionais que rodam tudo no Node.js, o RootTask opera com processos separados e otimizados:

*   **Frontend / UI:** HTML, CSS e JavaScript puros rodando no **Electron**.
*   **Backend:** API local em Python utilizando **FastAPI**.
*   **Banco de Dados:** Conexão com **PostgreSQL** para gestão de dados.

