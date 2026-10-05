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
    
    # O SELECT * já vai puxar a nova coluna priority automaticamente
    cursor.execute(
        "SELECT * FROM tarefas ORDER BY id DESC;"
    ) 
    
    tarefas = cursor.fetchall()
    cursor.close()

    return tarefas

# RESET DAS TAREFAS DIÁRIAS
@router.post("/reset-diarias")
def resetar_tarefas_diarias(dados=Depends(get_db)):

    cursor = dados.cursor()

    cursor.execute(
        """
        UPDATE tarefas
        SET status = FALSE
        WHERE priority = 4
        AND status = TRUE;
        """
    )

    dados.commit()

    cursor.close()

    return {"mensagem": "Tarefas diárias resetadas com sucesso!"}

# CRIA NOVAS TAREFAS
@router.post("/", response_model=Tarefa)
def criar_tarefa(tarefa: TarefaCriacao, dados=Depends(get_db)):
    cursor = dados.cursor(cursor_factory=RealDictCursor)

    cursor.execute(
        """
        INSERT INTO tarefas (tarefa, priority) 
        VALUES (%s, %s) 
        RETURNING id, tarefa, status, priority;
        """, 
        [tarefa.tarefa, tarefa.priority]
    ) 

    nova_tarefa = cursor.fetchone()
    dados.commit()
    cursor.close()

    return nova_tarefa

# DELETA A TAREFA
@router.delete("/{id}")
def excluir_tarefa(id: int, dados=Depends(get_db)):
    cursor = dados.cursor(cursor_factory=RealDictCursor)

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

    dados.commit()
    cursor.close()

    return {"mensagem": "Tarefa excluída com sucesso!"}

# ATUALIZAÇÃO DE TAREFA
@router.put("/{id}", response_model=Tarefa)
def atualizar_tarefa(id: int, tarefa_atualizada: TarefaAtualizacao, dados=Depends(get_db)):
    cursor = dados.cursor(cursor_factory=RealDictCursor)

    # COALESCE garante que valores não enviados (None/NULL) não sobrescrevam os dados existentes
    cursor.execute(
        """
        UPDATE tarefas
        SET tarefa = COALESCE(%s, tarefa), 
        status = COALESCE(%s, status), 
        priority = COALESCE(%s, priority)
        WHERE id = %s
        RETURNING id, tarefa, status, priority;
        """,
        [tarefa_atualizada.tarefa, tarefa_atualizada.status, tarefa_atualizada.priority, id]
    )

    tarefa_editada = cursor.fetchone()

    if not tarefa_editada:
        cursor.close()
        raise HTTPException(
            status_code=404,
            detail="Tarefa não encontrada."
        )

    dados.commit()
    cursor.close()

    return tarefa_editada