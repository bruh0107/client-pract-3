Vue.component('kanban-column', {
    template: `
        <div class="board-column">
            <h2 class="column-title">{{ column.title }}</h2>
            <div class="task-wrapper">
                <div class="task-card"></div>
                <button>Создать задачу</button>
                <div>
                    <input placeholder="Заголовок задачи">
                    <textarea placeholder="Описание задачи"></textarea>
                    <input type="date">
                    <button>Создать</button>
                    <button>Отмена</button>
                </div>
            </div>
        </div>
    `,
    props: ['column', 'columnIndex'],
    data() {
        return {
            snowForm: false,
            newTask: {
                title: '',
                description: '',
                deadline: null,
            }
        }
    },
})

let app = new Vue ({
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
    }
})