from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  

from app.routes import tarefas

app = FastAPI(title="TaskDo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Libera requisições de qualquer origem (ideal para desenvolvimento)
    allow_credentials=True,
    allow_methods=["*"], # Libera todos os métodos HTTP (GET, POST, PUT, DELETE)
    allow_headers=["*"], # Libera todos os cabeçalhos de requisição
)

app.include_router(tarefas.router)

@app.get("/")
def raiz():
    return {"mensagem": "Bem-vindo à API do TaskDo!"}