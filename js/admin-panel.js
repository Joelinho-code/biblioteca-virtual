import { logout } from './auth.js'
import { getTEGs, deleteTEG, updateTEG, getCarreras } from './teg-service.js'

let currentTEGs = []
let currentPage = 1
const ITEMS_PER_PAGE = 10

export async function initAdminPanel() {
    // Verificar autenticación
    const user = await checkAuth()
    if (!user) {
        window.location.href = 'formulario.html'
        return
    }

    // Configurar eventos
    setupEventListeners()
    
    // Cargar datos iniciales
    await loadAdminTEGs()
    await loadCarrerasFilter()
}

async function checkAuth() {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
        return false
    }
    return true
}

async function loadAdminTEGs() {
    try {
        currentTEGs = await getTEGs({ estatus: 'all' })
        renderAdminTable(currentTEGs.slice(0, ITEMS_PER_PAGE))
        updateAdminPagination()
    } catch (error) {
        console.error('Error cargando TEGs:', error)
        alert('Error al cargar los TEGs')
    }
}

async function loadCarrerasFilter() {
    const carreras = await getCarreras()
    const filterSelect = document.getElementById('admin-filter')
    
    carreras.forEach(carrera => {
        const option = document.createElement('option')
        option.value = carrera.id
        option.textContent = carrera.nombre
        filterSelect.appendChild(option)
    })
}

function renderAdminTable(tegs) {
    const tbody = document.querySelector('#admin-teg-table tbody')
    tbody.innerHTML = tegs.map(teg => `
        <tr data-id="${teg.id}">
            <td>${teg.titulo}</td>
            <td>${teg.autor}</td>
            <td>${teg.carreras.nombre}</td>
            <td>${new Date(teg.fecha).toLocaleDateString()}</td>
            <td>
                <select class="status-select" data-tegid="${teg.id}">
                    <option value="Vigente" ${teg.estatus === 'Vigente' ? 'selected' : ''}>Vigente</option>
                    <option value="Archivado" ${teg.estatus === 'Archivado' ? 'selected' : ''}>Archivado</option>
                    <option value="Descartado" ${teg.estatus === 'Descartado' ? 'selected' : ''}>Descartado</option>
                </select>
            </td>
            <td class="actions">
                <button class="btn small edit" data-id="${teg.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn small danger delete" data-id="${teg.id}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>
    `).join('')

    // Agregar event listeners para los selects de estatus
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const tegId = e.target.dataset.tegid
            const newStatus = e.target.value
            
            try {
                await updateTEG(tegId, { estatus: newStatus })
                showToast('Estatus actualizado correctamente')
            } catch (error) {
                console.error('Error actualizando estatus:', error)
                showToast('Error al actualizar estatus', 'error')
            }
        })
    })
}

function updateAdminPagination() {
    const totalPages = Math.ceil(currentTEGs.length / ITEMS_PER_PAGE)
    document.querySelector('.page-info').textContent = `Página ${currentPage} de ${totalPages}`
    
    document.querySelector('.prev-btn').disabled = currentPage === 1
    document.querySelector('.next-btn').disabled = currentPage === totalPages
}

function setupEventListeners() {
    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await logout()
        window.location.href = 'formulario.html'
    })

    // Navegación del panel
    document.getElementById('add-teg-btn').addEventListener('click', () => {
        document.getElementById('teg-form').style.display = 'block'
        document.getElementById('teg-list').style.display = 'none'
    })

    document.getElementById('view-tegs-btn').addEventListener('click', () => {
        document.getElementById('teg-form').style.display = 'none'
        document.getElementById('teg-list').style.display = 'block'
    })

    // Búsqueda y filtros
    document.getElementById('admin-search-btn').addEventListener('click', applyAdminFilters)
    document.getElementById('admin-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyAdminFilters()
    })

    document.getElementById('admin-filter').addEventListener('change', applyAdminFilters)

    // Paginación
    document.querySelector('.next-btn').addEventListener('click', () => {
        if (currentPage < Math.ceil(currentTEGs.length / ITEMS_PER_PAGE)) {
            currentPage++
            renderAdminTable(currentTEGs.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
            ))
            updateAdminPagination()
        }
    })

    document.querySelector('.prev-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--
            renderAdminTable(currentTEGs.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
            ))
            updateAdminPagination()
        }
    })

    // Eliminar TEGs
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.delete')) {
            const tegId = e.target.closest('.delete').dataset.id
            if (confirm('¿Está seguro que desea eliminar este TEG permanentemente?')) {
                try {
                    await deleteTEG(tegId)
                    showToast('TEG eliminado correctamente')
                    await loadAdminTEGs()
                } catch (error) {
                    console.error('Error eliminando TEG:', error)
                    showToast('Error al eliminar TEG', 'error')
                }
            }
        }
    })
}

async function applyAdminFilters() {
    const searchTerm = document.getElementById('admin-search').value
    const carreraFilter = document.getElementById('admin-filter').value

    let filtered = currentTEGs

    if (searchTerm) {
        filtered = filtered.filter(teg => 
            teg.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teg.autor.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    if (carreraFilter !== 'all') {
        filtered = filtered.filter(teg => teg.carrera_id == carreraFilter)
    }

    currentPage = 1
    renderAdminTable(filtered.slice(0, ITEMS_PER_PAGE))
    updateAdminPagination()
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
        toast.remove()
    }, 3000)
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initAdminPanel)