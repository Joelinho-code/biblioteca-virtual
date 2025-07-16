document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const addTegBtn = document.getElementById('add-teg-btn');
    const viewTegsBtn = document.getElementById('view-tegs-btn');
    const tegForm = document.getElementById('teg-form');
    const tegList = document.getElementById('teg-list');
    const tegRegistrationForm = document.getElementById('teg-registration-form');
    const adminTegTable = document.getElementById('admin-teg-table');
    
    // Estado de autenticación (simulado)
    let isAuthenticated = false;
    
    // Inicializar la página
    checkAuth();
    
    // Manejar inicio de sesión
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simular autenticación (en un sistema real, esto sería una llamada a una API)
        if (username === 'admin' && password === 'admin123') {
            isAuthenticated = true;
            localStorage.setItem('bibliotecaAuth', 'true');
            checkAuth();
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });
    
    // Manejar cierre de sesión
    logoutBtn.addEventListener('click', function() {
        isAuthenticated = false;
        localStorage.removeItem('bibliotecaAuth');
        checkAuth();
        tegRegistrationForm.reset();
    });
    
    // Manejar botones de acciones administrativas
    addTegBtn.addEventListener('click', function() {
        tegForm.style.display = 'block';
        tegList.style.display = 'none';
    });
    
    viewTegsBtn.addEventListener('click', function() {
        tegForm.style.display = 'none';
        tegList.style.display = 'block';
        loadTEGsForAdmin();
    });
    
    // Manejar envío del formulario de TEG
    tegRegistrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const titulo = document.getElementById('teg-titulo').value;
        const carrera = document.getElementById('teg-carrera').value;
        const autor = document.getElementById('teg-autor').value;
        const tutor = document.getElementById('teg-tutor').value;
        const fecha = document.getElementById('teg-fecha').value;
        const status = document.getElementById('teg-status').value;
        const resumen = document.getElementById('teg-resumen').value;
        const archivoInput = document.getElementById('teg-archivo');
        
        // Validar archivo
        if (archivoInput.files.length === 0) {
            alert('Por favor, seleccione un archivo PDF');
            return;
        }
        
        const archivo = archivoInput.files[0];
        if (archivo.type !== 'application/pdf') {
            alert('El archivo debe ser un PDF');
            return;
        }
        
        if (archivo.size > 10 * 1024 * 1024) { // 10MB
            alert('El archivo es demasiado grande (máximo 10MB)');
            return;
        }
        
        // Crear nuevo TEG (en un sistema real, esto se enviaría a un servidor)
        const newTEG = {
            id: sampleTEGs.length + 1,
            titulo,
            autor,
            tutor,
            carrera,
            fecha: formatDateForStorage(fecha),
            resumen,
            estatus: status,
            archivo: archivo.name
        };
        
        // Agregar a la lista (simulado)
        sampleTEGs.unshift(newTEG);
        
        // Mostrar mensaje de éxito
        alert('TEG registrado exitosamente');
        
        // Resetear formulario
        tegRegistrationForm.reset();
        
        // Mostrar la lista actualizada
        loadTEGsForAdmin();
        tegForm.style.display = 'none';
        tegList.style.display = 'block';
    });
    
    // Función para verificar autenticación
    function checkAuth() {
        const savedAuth = localStorage.getItem('bibliotecaAuth');
        if (savedAuth === 'true') {
            isAuthenticated = true;
        }
        
        if (isAuthenticated) {
            loginSection.style.display = 'none';
            adminSection.style.display = 'block';
            loadTEGsForAdmin();
        } else {
            loginSection.style.display = 'block';
            adminSection.style.display = 'none';
        }
    }
    
    // Función para cargar TEGs en la tabla administrativa
    function loadTEGsForAdmin() {
        const tbody = adminTegTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        sampleTEGs.forEach(teg => {
            const [year, month] = teg.fecha.split('-');
            const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const formattedDate = `${monthNames[parseInt(month) - 1]} ${year}`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${teg.titulo}</td>
                <td>${teg.autor}</td>
                <td>${teg.carrera}</td>
                <td>${formattedDate}</td>
                <td>${teg.estatus}</td>
                <td class="action-btns">
                    <button class="edit-btn" data-id="${teg.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-btn" data-id="${teg.id}"><i class="fas fa-trash"></i> Eliminar</button>
                    <button class="view-btn" data-id="${teg.id}"><i class="fas fa-eye"></i> Ver</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tegId = parseInt(this.getAttribute('data-id'));
                editTEG(tegId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tegId = parseInt(this.getAttribute('data-id'));
                deleteTEG(tegId);
            });
        });
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tegId = parseInt(this.getAttribute('data-id'));
                viewTEGDetails(tegId);
            });
        });
    }
    
    // Función para editar un TEG (simulado)
    function editTEG(tegId) {
        const teg = sampleTEGs.find(t => t.id === tegId);
        if (teg) {
            // Llenar el formulario con los datos del TEG
            document.getElementById('teg-titulo').value = teg.titulo;
            document.getElementById('teg-carrera').value = teg.carrera;
            document.getElementById('teg-autor').value = teg.autor;
            document.getElementById('teg-tutor').value = teg.tutor;
            document.getElementById('teg-fecha').value = formatDateForInput(teg.fecha);
            document.getElementById('teg-status').value = teg.estatus;
            document.getElementById('teg-resumen').value = teg.resumen;
            
            // Mostrar el formulario
            tegForm.style.display = 'block';
            tegList.style.display = 'none';
            
            // Scroll al formulario
            tegForm.scrollIntoView({ behavior: 'smooth' });
            
            // TODO: Implementar lógica para actualizar en lugar de crear nuevo
        }
    }
    
    // Función para eliminar un TEG (simulado)
    function deleteTEG(tegId) {
        if (confirm('¿Está seguro que desea eliminar este TEG? Esta acción no se puede deshacer.')) {
            const index = sampleTEGs.findIndex(t => t.id === tegId);
            if (index !== -1) {
                sampleTEGs.splice(index, 1);
                loadTEGsForAdmin();
                alert('TEG eliminado exitosamente');
            }
        }
    }
    
    // Función para ver detalles de un TEG (simulado)
    function viewTEGDetails(tegId) {
        const teg = sampleTEGs.find(t => t.id === tegId);
        if (teg) {
            alert(`Detalles del TEG:\n\nTítulo: ${teg.titulo}\nAutor(es): ${teg.autor}\nTutor: ${teg.tutor}\nCarrera: ${teg.carrera}\nFecha: ${teg.fecha}\nEstatus: ${teg.estatus}\n\nResumen:\n${teg.resumen}`);
        }
    }
    
    // Función para formatear fecha para el input type="month"
    function formatDateForInput(dateStr) {
        return dateStr.replace('-', '-');
    }
    
    // Función para formatear fecha para almacenamiento
    function formatDateForStorage(dateStr) {
        return dateStr;
    }
    
    // Manejar búsqueda en la vista administrativa
    const adminSearch = document.getElementById('admin-search');
    const adminSearchBtn = document.getElementById('admin-search-btn');
    const adminFilter = document.getElementById('admin-filter');
    
    adminSearchBtn.addEventListener('click', function() {
        filterAdminTable();
    });
    
    adminSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterAdminTable();
        }
    });
    
    adminFilter.addEventListener('change', function() {
        filterAdminTable();
    });
    
    function filterAdminTable() {
        const searchTerm = adminSearch.value.toLowerCase();
        const filterValue = adminFilter.value;
        
        const rows = adminTegTable.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const title = row.cells[0].textContent.toLowerCase();
            const author = row.cells[1].textContent.toLowerCase();
            const career = row.cells[2].textContent;
            
            const matchesSearch = title.includes(searchTerm) || author.includes(searchTerm);
            const matchesFilter = filterValue === 'all' || career === filterValue;
            
            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
    }
});