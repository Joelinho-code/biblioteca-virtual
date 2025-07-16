import supabase from './supabase-client.js'

const TEG_BUCKET = 'teg-documents'

export async function uploadPDF(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${fileName}`

    const { error } = await supabase.storage
        .from(TEG_BUCKET)
        .upload(filePath, file)

    if (error) throw new Error(error.message)
    return filePath
}

export async function createTEG(tegData) {
    try {
        // Subir archivo primero
        const filePath = await uploadPDF(tegData.archivo)
        
        // Obtener URL pública
        const { data: urlData } = supabase.storage
            .from(TEG_BUCKET)
            .getPublicUrl(filePath)

        // Insertar en base de datos
        const { data, error } = await supabase
            .from('teg')
            .insert([{
                titulo: tegData.titulo,
                carrera_id: tegData.carrera_id,
                autor: tegData.autor,
                tutor: tegData.tutor,
                resumen: tegData.resumen,
                fecha: new Date(tegData.fecha).toISOString(),
                estatus: tegData.estatus,
                archivo_url: urlData.publicUrl,
                palabras_clave: tegData.palabras_clave?.split(',').map(p => p.trim()) || []
            }])
            .select()

        if (error) throw error
        return data[0]
    } catch (error) {
        console.error('Error creando TEG:', error)
        throw error
    }
}

export async function getTEGs(filter = {}) {
    try {
        let query = supabase
            .from('teg')
            .select(`
                *,
                carreras: carrera_id (nombre)
            `)
            .order('fecha', { ascending: false })

        // Aplicar filtros
        if (filter.carrera) query = query.eq('carrera_id', filter.carrera)
        if (filter.anio) query = query.eq('fecha', `${filter.anio}-01-01`)
        if (filter.estatus) query = query.eq('estatus', filter.estatus)
        if (filter.search) {
            query = query.or(
                `titulo.ilike.%${filter.search}%,autor.ilike.%${filter.search}%,resumen.ilike.%${filter.search}%`
            )
        }

        const { data, error } = await query

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error obteniendo TEGs:', error)
        throw error
    }
}

export async function updateTEG(id, updates) {
    try {
        const { data, error } = await supabase
            .from('teg')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0]
    } catch (error) {
        console.error('Error actualizando TEG:', error)
        throw error
    }
}

export async function deleteTEG(id) {
    try {
        // Primero obtener info del TEG para eliminar el archivo
        const { data: teg, error: fetchError } = await supabase
            .from('teg')
            .select('archivo_url')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        // Extraer el path del archivo de la URL
        const filePath = teg.archivo_url.split('/').pop()

        // Eliminar el archivo del storage
        const { error: storageError } = await supabase.storage
            .from(TEG_BUCKET)
            .remove([filePath])

        if (storageError) throw storageError

        // Finalmente eliminar el registro de la base de datos
        const { error } = await supabase
            .from('teg')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error eliminando TEG:', error)
        throw error
    }
}

export async function getCarreras() {
    const { data, error } = await supabase
        .from('carreras')
        .select('*')
        .order('nombre', { ascending: true })

    if (error) throw error
    return data
}