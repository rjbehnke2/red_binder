import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCategoriesStore } from '../store/categoriesStore'
import { useUser } from '../lib/auth'

export function useCategories() {
  const user = useUser()
  const { categories, setCategories, setLoading, addCategory, updateCategory, removeCategory } =
    useCategoriesStore()

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data, error }) => {
        if (!error && data) setCategories(data)
        setLoading(false)
      })
  }, [user?.id])

  const create = async ({ name, color, icon }) => {
    const sort_order = categories.length
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, color, icon, sort_order })
      .select()
      .single()
    if (!error && data) addCategory(data)
    return { data, error }
  }

  const update = async (id, updates) => {
    const { error } = await supabase.from('categories').update(updates).eq('id', id)
    if (!error) updateCategory(id, updates)
    return { error }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) removeCategory(id)
    return { error }
  }

  return { categories, create, update, remove }
}
