import supabase from './supabase-client.js'
import { getTEGs } from './teg-service.js'

const RESULTS_PER_PAGE = 10
let currentPage = 1
let totalPages = 1
let currentFilters = {}

export async function loadTEGs(filters = {}) {
    try {
        currentFilters = filters
        showLoader()

        const allTEGs = await getTEGs(filters)
        totalPages = Math.ceil(allTEGs.length / RESULTS_PER_PAGE)
        currentPage = 1

        renderResults(allTEGs.slice(0, RESULTS_PER_PAGE))
        updatePagination()
    } catch (error) {
        showError()
    }
}

function showLoader() {
    document.querySelector('.results-grid').innerHTML = `
        <div class="loader">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando TEGs...</p>
        </div>
    `
}

function showError() {
    document.querySelector('.results-grid').innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error al cargar los TEGs. Intente nuevamente.</p>
        </div>
    `
}

export function renderResults(tegs) {
    const container = document.querySelector('.results-grid')
    
    if (!tegs || tegs.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No se encontraron TEGs con los filtros aplicados</p>
            </div>
        `
        return
    }

    container.innerHTML = tegs.map(teg => `
        <div class="teg-card">
            <div class="teg-header">
                <h3>${teg.titulo}</h3>
                <span class="teg-carrera">${teg.carreras.nombre}</span>
            </div>
            <div class="teg-meta">
                <p><i class="fas fa-user-graduate"></i> ${teg.autor}</p>
                <p><i class="fas fa-calendar-alt"></i> ${new Date(teg.fecha).getFullYear()}</p>
            </div>
            <div class="teg-summary">
                <p>${teg.resumen.substring(0, 200)}${teg.resumen.length > 200 ? '...' : ''}</p>
            </div>
            <div class="teg-actions">
                <a href="/teg-detalle.html?id=${teg.id}" class="btn small">
                    <i class="fas fa-book-open"></i> Ver detalles
                </a>
                <a href="${teg.archivo_url}" target="_blank" class="btn small secondary">
                    <i class="fas fa-download"></i> Descargar PDF
                </a>
            </div>
        </div>
    `).join('')
}

export function updatePagination() {
    const pageInfo = document.querySelector('.page-info')
    const prevBtn = document.querySelector('.prev-btn')
    const nextBtn = document.querySelector('.next-btn')

    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`
    prevBtn.disabled = currentPage === 1
    nextBtn.disabled = currentPage === totalPages
}

export async function nextPage() {
    if (currentPage < totalPages) {
        currentPage++
        const allTEGs = await getTEGs(currentFilters)
        const startIdx = (currentPage - 1) * RESULTS_PER_PAGE
        renderResults(allTEGs.slice(startIdx, startIdx + RESULTS_PER_PAGE))
        updatePagination()
    }
}

export async function prevPage() {
    if (currentPage > 1) {
        currentPage--
        const allTEGs = await getTEGs(currentFilters)
        const startIdx = (currentPage - 1) * RESULTS_PER_PAGE
        renderResults(allTEGs.slice(startIdx, startIdx + RESULTS_PER_PAGE))
        updatePagination()
    }
}

// Inicialización de eventos
export function initSearch() {
    document.getElementById('search-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const searchTerm = document.getElementById('search-input').value
        const carrera = document.getElementById('carrera-filter').value
        const year = document.getElementById('year-filter').value
        
        await loadTEGs({
            search: searchTerm,
            carrera: carrera || null,
            anio: year || null
        })
    })

    document.querySelector('.next-btn').addEventListener('click', nextPage)
    document.querySelector('.prev-btn').addEventListener('click', prevPage)
}

// Cargar años para el filtro
export async function loadYearFilters() {
    const { data: years } = await supabase
        .from('teg')
        .select('fecha')
        .order('fecha', { ascending: false })
    
    const uniqueYears = [...new Set(years.map(item => new Date(item.fecha).getFullYear()))]
    
    const yearSelect = document.getElementById('year-filter')
    uniqueYears.forEach(year => {
        const option = document.createElement('option')
        option.value = year
        option.textContent = year
        yearSelect.appendChild(option)
    })
}