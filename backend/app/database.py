import os

import psycopg2

from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env para que o Python consiga ler as senhas e portas
load_dotenv()

# FUNÇÃO DE CONEXÃO DE BANCO DE DADOS
def get_db_connection():
    # Abre a conexão com o PostgreSQL usando os dados secretos guardados no arquivo .env
    dados = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )

    return dados

def get_db():
    # Abre a conexão usando a função acima
    dados = get_db_connection()

    try:
        # 'yield' entrega a conexão ativa para a rota que pediu (usada no Depends)
        yield dados
    finally:
        # Garante que a conexão será fechada ao terminar a requisição, mesmo se der algum erro no meio do caminho
        dados.close()