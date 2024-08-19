const input = document.querySelector(".todoInput");
const ul = document.querySelector(".todoList");
const completedUl = document.querySelector(".completed-todoList");
const deletedUl = document.querySelector(".deleted-todoList");
const form = document.querySelector(".todoForm");
const dropdownButton = document.querySelector('.dropdown-button');
const dropdownMenu = document.querySelector('.dropdown-menu');
const sections = document.querySelectorAll('section');
const filterLi = document.querySelectorAll('li > a');

// import { getTime } from "./functions/getTime.js";

document.addEventListener("DOMContentLoaded", () => {
    localStorageUi();
    checkEmptySections();
});

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

dropdownButton.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
});

filterLi.forEach(function (filterLi) {
    filterLi.addEventListener('click', function (e) {
        const sectionId = filterLi.getAttribute('href').substring(1);
        showSection(sectionId);
    });
});

input.addEventListener('input', function () {
    input.setCustomValidity('');
});

form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (input.value.trim() == '') {
            input.setCustomValidity("You can't leave this field blank!");
            input.reportValidity();
        return;
    }

    let newTask = {
        id: Date.now(),
        text: input.value,
        date: `Date added: ${getTime()}`,
        status: "pending"
    };

    tasks.push(newTask);
    let li = createTodoElement(newTask, "pending");
    input.value = '';
    ul.insertBefore(li, ul.firstChild);
    saveToLocalStorage();
    checkEmptySections();
    showNotification('Task added successfully!');
});

function createTodoElement(task, status) {
    let li = document.createElement('li');
    li.dataset.id = task.id;

    let checkbox = createCheckbox(li);
    if (status !== "deleted") {
        li.appendChild(checkbox);
    }

    let taskText = document.createElement('span');
    taskText.textContent = task.text;
    li.appendChild(taskText);

    let dateDiv = document.createElement('span');
    dateDiv.textContent = task.date;
    dateDiv.classList.add('date');
    li.appendChild(dateDiv);

    let deleteBtn = createDeleteButton(li);
    let editBtn = createEditButton(li);
    let btnDiv = document.createElement('span');
    btnDiv.classList.add('btnDiv');
    btnDiv.appendChild(deleteBtn);
    btnDiv.appendChild(editBtn);
    li.appendChild(btnDiv);

    li.dataset.status = status;
    saveToLocalStorage();

    return li;
}

function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function localStorageUi() {
    tasks.forEach(task => {
        let li = createTodoElement(task, task.status);
        if (task.status == "pending") {
            ul.appendChild(li);
        } else if (task.status == "completed") {
            li.querySelector('input[type="checkbox"]').checked = true;
            li.querySelector('span').style.textDecoration = 'line-through';
            li.querySelector('span').style.color = '#888';
            completedUl.appendChild(li);
        } else if (task.status == "deleted") {
            deletedUl.appendChild(li);
        }
    });
}

function createDeleteButton(li) {
    let deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.classList.add('deleteBtn');
    deleteBtn.onclick = function () {
        let task = tasks.find(t => t.id == li.dataset.id);

        if (li.dataset.status == 'deleted') {
            if (confirm("Are you sure you want to completely delete this task?")) {
                tasks = tasks.filter(t => t.id != task.id);
                li.remove();
                saveToLocalStorage();
                checkEmptySections();
                showNotification('Task completely deleted!');
            }
        } else {
            task.status = "deleted";
            li.dataset.status = "deleted";
            li.removeChild(li.querySelector('input[type="checkbox"]'));
            deletedUl.insertBefore(li, deletedUl.firstChild);

            let editBtn = li.querySelector('.editBtn');
            editBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
            editBtn.classList.remove('editBtn');
            editBtn.classList.add('restoreBtn');
            editBtn.onclick = function () {
                task.status = "pending";
                li.dataset.status = "pending";
                ul.insertBefore(li, ul.firstChild);

                let checkbox = createCheckbox(li);
                li.insertBefore(checkbox, li.firstChild);

                editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                editBtn.classList.remove('restoreBtn');
                editBtn.classList.add('editBtn');

                editBtn.onclick = function () {
                    if (editBtn.innerHTML.includes("fa-pencil")) {
                        let taskText = li.querySelector('span');
                        let input = document.createElement('input');
                        input.type = "text";
                        input.value = taskText.textContent;
                        input.required = true;
                        li.replaceChild(input, taskText);
                        editBtn.innerHTML = '<i class="fa-solid fa-save"></i>';
                    } else if (editBtn.innerHTML.includes("fa-save")) {
                        let input = li.querySelector('input[type="text"]');
                        if (input.value.trim() !== "") {
                            let taskText = document.createElement('span');
                            taskText.textContent = input.value;
                            li.replaceChild(taskText, input);
                            editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';

                            let dateDiv = li.querySelector('.date');
                            dateDiv.textContent = `Date edited: ${getTime()}`;

                            let task = tasks.find(t => t.id == li.dataset.id);
                            if (task.status == 'completed') {
                                taskText.style.textDecoration = 'line-through';
                                taskText.style.color = '#888';
                            }

                            saveToLocalStorage();
                            checkEmptySections();

                        } else {
                            input.setCustomValidity("You can't leave this field blank!");
                            input.reportValidity();
                            showNotification('Task edited successfully!');

                        }
                    }
                };
                saveToLocalStorage();
                checkEmptySections();
                showNotification('Task restored to pending!');
            };
            saveToLocalStorage();
            checkEmptySections();
            showNotification('Task moved to deleted!');
        }
    };
    return deleteBtn;
}

function createEditButton(li) {
    let editBtn = document.createElement('button');
    let task = tasks.find(t => t.id == li.dataset.id);

    if (task.status !== "deleted") {
        editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
        editBtn.classList.add('editBtn');
        editBtn.onclick = function () {
            if (editBtn.innerHTML.includes("fa-pencil")) {
                let taskText = li.querySelector('span');
                let input = document.createElement('input');
                input.type = "text";
                input.value = taskText.textContent;
                input.required = true;
                li.replaceChild(input, taskText);
                editBtn.innerHTML = '<i class="fa-solid fa-save"></i>';
            } else if (editBtn.innerHTML.includes("fa-save")) {
                let input = li.querySelector('input[type="text"]');
                if (input.value.trim() !== "") {
                    let taskText = document.createElement('span');
                    taskText.textContent = input.value;
                    li.replaceChild(taskText, input);
                    editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';

                    let dateDiv = li.querySelector('.date');
                    dateDiv.textContent = `Date edited: ${getTime()}`;

                    let task = tasks.find(t => t.id == li.dataset.id);
                    if (task.status == 'completed') {
                        taskText.style.textDecoration = 'line-through';
                        taskText.style.color = '#888';
                    }
                    saveToLocalStorage();
                    checkEmptySections();
                } else {
                    input.setCustomValidity("You can't leave this field blank!");
                    input.reportValidity();
                }
            }
        };
    } else {
        editBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
        editBtn.classList.add('restoreBtn');
        editBtn.onclick = function () {
            task.status = "pending";
            saveToLocalStorage();
            checkEmptySections(); // Görev geri alındığında kontrol et
        };
    }
    return editBtn;
}

function createCheckbox(li) {
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('checkbox');
    let task = tasks.find(t => t.id == li.dataset.id);
    if (task.status == 'completed') {
        checkbox.checked = true;
    }
    checkbox.addEventListener('click', function () {
        let task = tasks.find(t => t.id == li.dataset.id);
        if (checkbox.checked) {
            task.status = 'completed';
            li.querySelector('span').style.textDecoration = 'line-through';
            li.querySelector('span').style.color = '#888';
            completedUl.insertBefore(li, completedUl.firstChild);
            showNotification('Task completed succesfully!');
        } else {
            task.status = 'pending';
            li.querySelector('span').style.textDecoration = 'none';
            li.querySelector('span').style.color = '#000';
            ul.insertBefore(li, ul.firstChild);
            showNotification('Task restored to pending!');
        }
        saveToLocalStorage();
        checkEmptySections();
    });
    return checkbox;
}

function checkEmptySections() {
    sections.forEach(section => {
        let list = section.querySelector('ul');
        let noTasksMsg = section.querySelector('.no-tasks');
        if (list.children.length == 0) {
            if (!noTasksMsg) {
                noTasksMsg = document.createElement('div');
                noTasksMsg.classList.add('no-tasks');
                noTasksMsg.textContent = 'No tasks here!';
                section.appendChild(noTasksMsg);
            }
        } else {
            if (noTasksMsg) {
                noTasksMsg.remove();
            }
        }
    });
}

function showSection(id) {
    sections.forEach(section => {
        if (section.id === id) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}
