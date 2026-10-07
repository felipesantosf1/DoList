from pydantic import BaseModel
from typing import Optional

# Quando você cria a tarefa, manda o texto e o nível de prioridade
class TarefaCriacao(BaseModel):
    tarefa: str
    priority: int

# Quando atualiza (texto, check de concluído ou mudando a prioridade)
class TarefaAtualizacao(BaseModel):
    tarefa: Optional[str] = None
    status: Optional[bool] = None
    priority: Optional[int] = None

# O que o frontend recebe do banco de dados
class Tarefa(BaseModel):
    id: int
    tarefa: str
    status: bool
    priority: int

    class Config:
        from_attributes = True

        