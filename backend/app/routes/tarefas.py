from fastapi import APIRouter, Depends, HTTPException
from psycopg2.extras import RealDictCursor

from app.database import get_db
from app.schemas.tarefa import Tarefa, TarefaCriacao, TarefaAtualizacao

# ROTA DA API
router = APIRouter(prefix="/tarefas", tags=["Tarefas"])

# PEGA INFORMAÇÕES
@router.get("/", response_model=list[Tarefa])
def listar_tarefas(dados=Depends(get_db)):

    cursor = dados.cursor(cursor_factory=RealDictCursor)

    cursor.execute(
        "SELECT * FROM tarefas ORDER BY id;"
    ) 
    
    tarefas = cursor.fetchall()
    cursor.close()

    return tarefas

# CRIA NOVOS TAREFAS
@router.post("/", response_model=Tarefa)
def criar_tarefa(tarefa: TarefaCriacao, dados=Depends(get_db)):

    cursor = dados.cursor(cursor_factory=RealDictCursor)

    cursor.execute(
        """
        INSERT INTO tarefas (tarefa) 
        VALUES (%s) 
        RETURNING id, tarefa, status;
        """, 
        [tarefa.tarefa]
    ) 

    # fetchone() captura a única linha que o RETURNING devolveu
    nova_tarefa = cursor.fetchone()

    # Confirma e salva a inserção de fato no banco de dados
    dados.commit()

    cursor.close()

    return nova_tarefa

# DELETA A TAREFA
@router.delete("/{id}")
def excluir_tarefa(id: int, dados=Depends(get_db)):

    cursor = dados.cursor(cursor_factory=RealDictCursor)

    # deleta a tarefa onde o ID da tarefa seja igual ao tarefa_id que veio na URL
    cursor.execute(
        "DELETE FROM tarefas WHERE id = %s RETURNING id;",
        [id]
    )

    tarefa_deletada = cursor.fetchone()

    if not tarefa_deletada:
        cursor.close()
        raise HTTPException(
            status_code=404,
            detail="Tarefa não encontrada."
        )

    # 3. Se a tarefa existia e foi deletada, confirmamos a ação no banco
    dados.commit()
    cursor.close()

    return {"mensagem": "Tarefa excluída com sucesso!"}


# ATUALIZAÇÃO DE TAREFA
@router.put("/{id}", response_model=Tarefa)
def atualizar_tarefa(id: int, tarefa_atualizada: TarefaAtualizacao, dados=Depends(get_db)):
    
    cursor = dados.cursor(cursor_factory=RealDictCursor)

    # O comando UPDATE altera apenas a linha onde o id bate com a URL
    cursor.execute(
        """
        UPDATE tarefas
        SET tarefa = %s, status = %s
        WHERE id = %s
        RETURNING id, tarefa, status;
        """,
        # Passamos os três valores correspondentes aos três %s do SQL (incluindo o id no final)
        [tarefa_atualizada.tarefa, tarefa_atualizada.status, id]
    )

    tarefa_editada = cursor.fetchone()

    # Se o banco não devolveu nada, é porque o id não existe
    if not tarefa_editada:
            cursor.close()
            raise HTTPException(
                status_code=404,
                detail="Tarefa não encontrada."
            )

    dados.commit()
    cursor.close()

    return tarefa_editada