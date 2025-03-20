Vue.component('kanban-column', {
    template: `
        <div class="board-column">
            <h2 class="column-title">{{ column.title }}</h2>
            <div class="task-wrapper">
                <task-card
                    v-for="(task, taskIndex) in column.tasks"
                    :key="task.id"
                    :task="task"
                    :column-index="columnIndex"
                    @move-task="moveTask"
                    @edit-task="editTask"
                    @delete-task="deleteTask"
                ></task-card>
                <button
                    v-if="columnIndex === 0"
                    @click="showForm = true"
                >Создать задачу</button>
                <div v-if="showForm" class="task-form">
                    <input v-model="newTask.title" placeholder="Заголовок задачи">
                    <textarea v-model="newTask.description" placeholder="Описание задачи"></textarea>
                    <input type="date" v-model="newTask.deadline">
                    <button @click="createTask">Создать</button>
                    <button @click="showForm = false">Отмена</button>
                </div>
            </div>
        </div>
    `,
    props: ['column', 'columnIndex'],
    data() {
        return {
            showForm: false,
            newTask: {
                title: '',
                description: '',
                deadline: null,
            }
        }
    },
    methods: {
        createTask() {
            const task = {
                id: Date.now(),
                title: this.newTask.title,
                description: this.newTask.description,
                deadline: this.newTask.deadline,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'planned',
                isOverdue: false,
                returnReason: null
            }
            this.$emit('move-task', task, this.columnIndex)
            this.showForm = false
            this.newTask = { title: '', description: '', deadline: null }
        },

        moveTask(task, newColumnIndex) {
            this.$emit('move-task', task, newColumnIndex)
        },
        editTask(task) {
            this.$emit('edit-task', task)
        },
        deleteTask(task) {
            this.$emit('delete-task', task)
        }
    }
})

Vue.component('task-card', {
    template: `
        <div class="task" :class="{ 'overdue': isOverdue(task.deadline) && columnIndex === 3, 'completed': !isOverdue(task.deadline) && columnIndex === 3 }">
            <div v-if="!isEditing && !isReturningToWork">
                <p class="task-title">{{ task.title }}</p>
                <p class="task-description">{{ task.description }}</p>
                <p class="task-deadline">Дэдлайн: {{ formattedDate(task.deadline) }}</p>
                <p class="task-created">Создана: {{ formattedDate(task.createdAt) }}</p>
                <p class="task-updated">Последнее обновление: {{ formattedDate(task.updatedAt) }}</p>
                <p v-if="task.returnReason" class="task-return-reason">Причина возврата: {{ task.returnReason }}</p>
                <button @click="startEditing" v-if="columnIndex !== 3">Редактировать</button>
                <button @click="deleteTask">Удалить</button>
                <button v-if="columnIndex !== 3" @click="moveTask(columnIndex + 1)">Переместить вперед</button>
                <button v-if="columnIndex === 2" @click="startReturningToWork">Вернуть в работу</button>
            </div>
            <div v-else-if="isEditing" class="edit-form">
                <input v-model="editedTask.title" placeholder="Заголовок задачи">
                <textarea v-model="editedTask.description" placeholder="Описание задачи"></textarea>
                <input type="date" v-model="editedTask.deadline">
                <button @click="saveEditing">Сохранить</button>
                <button @click="cancelEditing">Отмена</button>
            </div>
            <div v-else-if="isReturningToWork" class="return-form">
                <textarea v-model="returnReason" placeholder="Причина возврата в работу"></textarea>
                <button @click="confirmReturnToWork">Подтвердить</button>
                <button @click="cancelReturnToWork">Отмена</button>
            </div>
        </div>
    `,
    props: ['task', 'columnIndex'],
    data() {
        return {
            isEditing: false,
            isReturningToWork: false,
            returnReason: '',
            editedTask: {
                title: this.task.title,
                description: this.task.description,
                deadline: this.task.deadline
            }
        }
    },
    methods: {
        formattedDate(date) {
            return date ? new Intl.DateTimeFormat('ru-RU').format(new Date(date)) : ''
        },
        startEditing() {
            this.isEditing = true
        },
        saveEditing() {
            this.$emit('edit-task', {
                ...this.task,
                title: this.editedTask.title,
                description: this.editedTask.description,
                deadline: this.editedTask.deadline,
                updatedAt: new Date()
            })
            this.isEditing = false
        },
        cancelEditing() {
            this.isEditing = false
            this.editedTask = {
                title: this.task.title,
                description: this.task.description,
                deadline: this.task.deadline
            }
        },
        startReturningToWork() {
            this.isReturningToWork = true
        },
        confirmReturnToWork() {
            this.$emit('move-task', this.task, 1, this.returnReason)
            this.isReturningToWork = false
            this.returnReason = ''
        },
        cancelReturnToWork() {
            this.isReturningToWork = false
            this.returnReason = ''
        },
        deleteTask() {
            this.$emit('delete-task', this.task)
        },
        moveTask(newColumnIndex) {
            this.$emit('move-task', this.task, newColumnIndex)
        },
        isOverdue(deadline) {
            return deadline && new Date(deadline) < new Date();
        },
    }
})

let app = new Vue({
    el: '#app',
    data() {
        return {
            columns: [
                {
                    title: 'Запланированные задачи',
                    tasks: []
                },
                {
                    title: 'Задачи в работе',
                    tasks: []
                },
                {
                    title: 'Тестирование',
                    tasks: []
                },
                {
                    title: 'Выполненные задачи',
                    tasks: []
                },
            ]
        }
    },
    methods: {
        moveTask(task, newColumnIndex, returnReason) {
            const currentColumnIndex = this.columns.findIndex(column => column.tasks.includes(task));
            if (currentColumnIndex !== -1) {
                this.columns[currentColumnIndex].tasks = this.columns[currentColumnIndex].tasks.filter(t => t.id !== task.id);
            }
            task.status = ['planned', 'in-progress', 'testing', 'completed'][newColumnIndex];
            task.updatedAt = new Date();

            if (newColumnIndex === 3) {
                task.isOverdue = task.deadline && new Date(task.deadline) < new Date();
            }

            if (returnReason) {
                task.returnReason = returnReason;
            }

            this.columns[newColumnIndex].tasks.push(task);
        },
        editTask(updatedTask, columnIndex) {
            this.columns[columnIndex].tasks =
                this.columns[columnIndex].tasks.map((task) => {
                    if (task.id === updatedTask.id) {
                        return {
                            ...task,
                            ...updatedTask
                        }
                    }
                    return task
                })
        },
        deleteTask(task) {
            const columnIndex = this.columns.findIndex(column => column.tasks.includes(task))
            if (columnIndex !== -1) {
                this.columns[columnIndex].tasks = this.columns[columnIndex].tasks.filter(t => t.id !== task.id)
            }
        }
    }
})

















