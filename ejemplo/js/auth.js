import supabase from './supabase-client.js'

export async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error
        return { success: true, user: data.user }
    } catch (error) {
        console.error('Error en login:', error.message)
        return { success: false, error: error.message }
    }
}

export async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error('Error al cerrar sesión:', error.message)
        return false
    }
    return true
}

export async function checkAuth() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
        console.error('Error verificando sesión:', error.message)
        return null
    }
    return user
}

export async function register(email, password, nombre) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre,
                    rol: 'admin'
                }
            }
        })

        if (error) throw error
        return { success: true, user: data.user }
    } catch (error) {
        console.error('Error en registro:', error.message)
        return { success: false, error: error.message }
    }
}