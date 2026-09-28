from pydantic import BaseModel
from typing import Optional

# Quando você cria a tarefa, só manda o texto
class TarefaCriacao(BaseModel):
    tarefa: str

# Quando você clica no check, manda apenas o True/False
class TarefaAtualizacao(BaseModel):
    tarefa: Optional[str] = None
    status: Optional[bool] = None

# O que o frontend recebe do banco de dados
class Tarefa(BaseModel):
    id: int
    tarefa: str
    status: bool

    class Config:
        from_attributes = True