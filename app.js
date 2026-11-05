const STORAGE_KEY = 'employee-management-employees';

const employeeForm = document.querySelector('#employee-form');
const employeeIdInput = document.querySelector('#employee-id');
const nameInput = document.querySelector('#name');
const positionInput = document.querySelector('#position');
const emailInput = document.querySelector('#email');
const employeeList = document.querySelector('#employee-list');
const employeeCount = document.querySelector('#employee-count');
const formTitle = document.querySelector('#form-title');
const submitButton = document.querySelector('#submit-button');
const cancelEditButton = document.querySelector('#cancel-edit');
const statusMessage = document.querySelector('#status-message');

let employees = loadEmployees();

function loadEmployees() {
  try {
    const storedEmployees = localStorage.getItem(STORAGE_KEY);
    if (storedEmployees === null) {
      return [];
    }

    const parsedEmployees = JSON.parse(storedEmployees);
    if (!Array.isArray(parsedEmployees)) {
      throw new Error('El formato de los empleados guardados no es válido.');
    }

    return parsedEmployees.filter((employee) =>
      employee &&
      Number.isInteger(employee.id) &&
      typeof employee.name === 'string' &&
      typeof employee.position === 'string' &&
      typeof employee.email === 'string'
    );
  } catch (error) {
    console.error('No se pudieron cargar los empleados desde localStorage.', error);
    showStatus('No se pudieron cargar los datos guardados. Revisa la consola del navegador.');
    return [];
  }
}

function saveEmployees() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    showStatus('');
    return true;
  } catch (error) {
    console.error('No se pudieron guardar los empleados en localStorage.', error);
    showStatus('No se pudieron guardar los cambios. Revisa el almacenamiento del navegador.');
    return false;
  }
}

function showStatus(message) {
  statusMessage.textContent = message;
}

function renderEmployees() {
  employeeList.replaceChildren();
  employeeCount.textContent = `${employees.length} ${employees.length === 1 ? 'empleado' : 'empleados'}`;

  if (employees.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.className = 'empty-state';
    cell.textContent = 'Aún no hay empleados. Agrega el primero con el formulario.';
    row.append(cell);
    employeeList.append(row);
    return;
  }

  employees.forEach((employee) => {
    const row = document.createElement('tr');
    appendCell(row, employee.id, 'employee-id');
    appendCell(row, employee.name, 'employee-name');
    appendCell(row, employee.position);
    appendCell(row, employee.email, 'employee-email');

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'action-button';
    editButton.textContent = 'Editar';
    editButton.setAttribute('aria-label', `Editar a ${employee.name}`);
    editButton.addEventListener('click', () => startEditing(employee));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'action-button delete';
    deleteButton.textContent = 'Eliminar';
    deleteButton.setAttribute('aria-label', `Eliminar a ${employee.name}`);
    deleteButton.addEventListener('click', () => deleteEmployee(employee.id));

    actions.append(editButton, deleteButton);
    actionsCell.append(actions);
    row.append(actionsCell);
    employeeList.append(row);
  });
}

function appendCell(row, value, className = '') {
  const cell = document.createElement('td');
  cell.textContent = String(value);
  if (className) {
    cell.className = className;
  }
  row.append(cell);
}

function startEditing(employee) {
  employeeIdInput.value = String(employee.id);
  nameInput.value = employee.name;
  positionInput.value = employee.position;
  emailInput.value = employee.email;
  formTitle.textContent = 'Editar empleado';
  submitButton.innerHTML = '<span aria-hidden="true">✓</span> Guardar cambios';
  cancelEditButton.hidden = false;
  nameInput.focus();
}

function resetForm() {
  employeeForm.reset();
  employeeIdInput.value = '';
  formTitle.textContent = 'Agregar empleado';
  submitButton.innerHTML = '<span aria-hidden="true">＋</span> Guardar empleado';
  cancelEditButton.hidden = true;
}

function deleteEmployee(id) {
  const employee = employees.find((item) => item.id === id);
  if (!employee || !window.confirm(`¿Seguro que deseas eliminar a ${employee.name}?`)) {
    return;
  }

  const previousEmployees = employees;
  employees = employees.filter((item) => item.id !== id);
  if (!saveEmployees()) {
    employees = previousEmployees;
    return;
  }

  if (employeeIdInput.value === String(id)) {
    resetForm();
  }
  renderEmployees();
}

employeeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const id = employeeIdInput.value ? Number(employeeIdInput.value) : null;
  const employeeData = {
    name: nameInput.value.trim(),
    position: positionInput.value.trim(),
    email: emailInput.value.trim()
  };

  if (!employeeData.name || !employeeData.position || !employeeData.email) {
    showStatus('Completa todos los campos antes de guardar.');
    return;
  }

  const previousEmployees = employees;
  if (id === null) {
    const nextId = employees.reduce((highestId, employee) => Math.max(highestId, employee.id), 0) + 1;
    employees = [...employees, { id: nextId, ...employeeData }];
  } else {
    employees = employees.map((employee) =>
      employee.id === id ? { id, ...employeeData } : employee
    );
  }

  if (!saveEmployees()) {
    employees = previousEmployees;
    return;
  }

  resetForm();
  renderEmployees();
});

cancelEditButton.addEventListener('click', resetForm);

renderEmployees();
