const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const prioBadge = document.getElementById('prioBadge');

// URL da sua API FastAPI (ajuste a porta se o seu backend estiver noutra)
const API_URL = 'http://localhost:8000/tarefas';

// Configuração de Prioridades com 'short' para a tag dentro da tarefa
const priorities = [
    { level: 1, label: '[P1: Alta]', color: 'var(--p-high)', short: 'P1' },
    { level: 2, label: '[P2: Média]', color: 'var(--p-med)', short: 'P2' },
    { level: 3, label: '[P3: Baixa]', color: 'var(--p-low)', short: 'P3' },
    { level: 4, label: '[P4: Diária]', color: 'var(--p-daily)', short: 'P4' }
];

let currentPrioIndex = 1; // Padrão: Média (Índice 1)
let currentFilter = 'all';


// COMUNICAÇÃO COM O BACKEND (API)
async function loadFromDB() {
    try {
        const response = await fetch(`${API_URL}/`);
        const tasks = await response.json();
        
        taskList.innerHTML = ''; // Limpa a lista atual
        tasks.forEach(task => {
            // Nota: as chaves vêm do seu Pydantic (id, tarefa, priority, status)
            renderTaskElement(task.id, task.tarefa, task.priority, task.status);
        });
        sortTasks();
        applyFilter();
    } catch (error) {
        console.error("Erro ao carregar as tarefas:", error);
    }
}

async function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const prio = priorities[currentPrioIndex];

    try {
        const response = await fetch(`${API_URL}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tarefa: text, priority: prio.level })
        });

        if (response.ok) {
            const newTask = await response.json();
            // Adiciona ao ecrã usando o ID gerado pelo PostgreSQL
            renderTaskElement(newTask.id, newTask.tarefa, newTask.priority, newTask.status);
            
            sortTasks();
            applyFilter();
            
            taskInput.value = '';
            taskInput.focus();
        }
    } catch (error) {
        console.error("Erro ao criar a tarefa:", error);
    }
}

async function toggleTask(checkbox) {
    const item = checkbox.closest('.task-item');
    const id = item.dataset.id;
    const isCompleted = checkbox.checked;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: isCompleted })
        });

        if (response.ok) {
            if (isCompleted) item.classList.add('completed');
            else item.classList.remove('completed');
            sortTasks(); 
            applyFilter();
        } else {
            checkbox.checked = !isCompleted; // Reverte se falhar
        }
    } catch (error) {
        console.error("Erro ao atualizar estado:", error);
        checkbox.checked = !isCompleted; 
    }
}

async function deleteTask(btn) {
    const item = btn.closest('.task-item');
    const id = item.dataset.id;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            item.remove();
        }
    } catch (error) {
        console.error("Erro ao eliminar a tarefa:", error);
    }
}

async function changeTaskPriority(indicatorElement) {
    const li = indicatorElement.closest('.task-item');
    const id = li.dataset.id;
    let currentLevel = parseInt(li.dataset.priority);
    
    // Calcula o próximo nível
    let nextLevel = currentLevel < 4 ? currentLevel + 1 : 1;
    const newPrio = priorities.find(p => p.level === nextLevel);

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority: nextLevel })
        });

        if (response.ok) {
            li.dataset.priority = nextLevel;
            li.className = `task-item priority-${nextLevel} ${li.classList.contains('completed') ? 'completed' : ''}`;
            indicatorElement.textContent = newPrio.short;

            sortTasks();
            applyFilter();
        }
    } catch (error) {
        console.error("Erro ao alterar a prioridade:", error);
    }
}


// LÓGICA DE INTERFACE E FILTROS
function cyclePriority() {
    currentPrioIndex = (currentPrioIndex + 1) % priorities.length;
    updatePrioBadge();
}

function updatePrioBadge() {
    const prio = priorities[currentPrioIndex];
    prioBadge.textContent = prio.label;
    prioBadge.style.setProperty('--curr-prio-color', prio.color);
}

function toggleFilterMenu() {
    document.getElementById('filterMenu').classList.toggle('show');
    document.getElementById('filterDropdown').classList.toggle('active');
}

window.onclick = function(event) {
    if (!event.target.closest('.filter-dropdown')) {
        document.getElementById('filterMenu').classList.remove('show');
        document.getElementById('filterDropdown').classList.remove('active');
    }
}

function setFilter(filterType, label) {
    currentFilter = filterType;
    document.getElementById('filterToggleBtn').innerHTML = `[Filtro: ${label}] <i class="fa-solid fa-chevron-down"></i>`;
    document.getElementById('filterMenu').classList.remove('show');
    document.getElementById('filterDropdown').classList.remove('active');
    applyFilter();
}

function applyFilter() {
    const items = Array.from(taskList.children);
    items.forEach(item => {
        const isCompleted = item.classList.contains('completed');
        const priority = item.dataset.priority;
        switch (currentFilter) {
            case 'active': item.style.display = !isCompleted ? 'flex' : 'none'; break;
            case 'completed': item.style.display = isCompleted ? 'flex' : 'none'; break;
            case 'p1': item.style.display = priority === '1' ? 'flex' : 'none'; break;
            case 'p2': item.style.display = priority === '2' ? 'flex' : 'none'; break;
            case 'p3': item.style.display = priority === '3' ? 'flex' : 'none'; break;
            case 'p4': item.style.display = priority === '4' ? 'flex' : 'none'; break;
            default: item.style.display = 'flex'; break;
        }
    });
}

function renderTaskElement(id, text, prioLevel, isCompleted = false) {
    const prio = priorities.find(p => p.level === prioLevel);
    
    const li = document.createElement('li');
    li.className = `task-item priority-${prioLevel} ${isCompleted ? 'completed' : ''}`;
    
    // GUARDA O ID DO BANCO NO HTML
    li.dataset.id = id;
    li.dataset.priority = prioLevel;
    
    li.innerHTML = `
        <label class="cyber-checkbox">
            <input type="checkbox" onchange="toggleTask(this)" ${isCompleted ? 'checked' : ''}>
            <div class="fill"></div>
        </label>
        <span class="task-prio-indicator" onclick="changeTaskPriority(this)" title="Clique para alterar prioridade">${prio.short}</span>
        <span class="task-text">${text}</span>
        <button class="delete-btn" onclick="deleteTask(this)">×</button>
    `;

    taskList.appendChild(li);
}

function sortTasks() {
    const items = Array.from(taskList.children);

    items.sort((a, b) => {
        const aCompleted = a.classList.contains('completed');
        const bCompleted = b.classList.contains('completed');

        // Concluídas sempre vão para o final
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;

        // Dentro do mesmo grupo, mais recente primeiro
        return parseInt(b.dataset.id) - parseInt(a.dataset.id);
    });

    items.forEach(item => taskList.appendChild(item));
}

// Edição com Duplo Clique integrando à API
taskList.addEventListener('dblclick', (e) => {
    if (!e.target.classList.contains('task-text')) return;

    const span = e.target;
    const li = span.closest('.task-item');
    const id = li.dataset.id;
    const currentText = span.textContent;
    const input = document.createElement('input');
    
    input.type = 'text';
    input.className = 'edit-input';
    input.value = currentText;

    span.replaceWith(input);
    input.focus();
    input.select();

    async function saveEdit() {
        const newText = input.value.trim() || currentText;
        
        // Só chama a API se o texto tiver realmente sido alterado
        if (newText !== currentText) {
            try {
                await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tarefa: newText })
                });
            } catch (error) {
                console.error("Erro ao editar o texto:", error);
            }
        }

        const newSpan = document.createElement('span');
        newSpan.className = 'task-text';
        newSpan.textContent = newText;
        input.replaceWith(newSpan);
    }

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (evt) => {
        if (evt.key === 'Enter') {
            input.removeEventListener('blur', saveEdit);
            saveEdit();
        } else if (evt.key === 'Escape') {
            input.removeEventListener('blur', saveEdit);
            const newSpan = document.createElement('span');
            newSpan.className = 'task-text';
            newSpan.textContent = currentText;
            input.replaceWith(newSpan);
        }
    });
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});



// RESET DAS TAREFAS DIÁRIAS
async function resetDailyTasks() {

    try {

        const response = await fetch(`${API_URL}/reset-diarias`, {

            method: 'POST'

        });

        if (response.ok) {

            console.log("Tarefas diárias resetadas.");

            return true;

        }

        console.error("Erro ao resetar tarefas diárias.");

        return false;

    } catch (error) {

        console.error("Erro ao conectar com a API para reset diário:", error);

        return false;

    }

}

async function checkDailyReset() {

    const today = new Date().toLocaleDateString('pt-BR');

    const lastReset = localStorage.getItem('lastDailyReset');

    // Primeira execução ou mudança de dia

    if (lastReset !== today) {

        const resetSuccessful = await resetDailyTasks();

        // Só registra a data se o backend respondeu corretamente

        if (resetSuccessful) {

            localStorage.setItem('lastDailyReset', today);

            return true;

        }

    }

    return false;

}

function scheduleMidnightReset() {

    const now = new Date();

    const nextMidnight = new Date();

    nextMidnight.setDate(now.getDate() + 1);

    nextMidnight.setHours(0, 0, 0, 0);

    const timeUntilMidnight = nextMidnight - now;

    setTimeout(async () => {

        await checkDailyReset();

        await loadFromDB();

        // Agenda novamente para a próxima meia-noite

        scheduleMidnightReset();

    }, timeUntilMidnight);

}

// INICIALIZAÇÃO
window.onload = async () => {

    updatePrioBadge();

    await checkDailyReset();

    await loadFromDB();

    scheduleMidnightReset();

};