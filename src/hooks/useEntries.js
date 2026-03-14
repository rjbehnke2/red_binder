import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useEntriesStore } from '../store/entriesStore'
import { useUser } from '../lib/auth'

export function useEntries() {
  const user = useUser()
  const { entries, setEntries, setLoading, addEntry, updateEntry, removeEntry, loading } =
    useEntriesStore()

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setEntries(data)
        setLoading(false)
      })
  }, [user?.id])

  const create = async (fields) => {
    const { data, error } = await supabase
      .from('entries')
      .insert({ user_id: user.id, ...fields })
      .select()
      .single()
    if (!error && data) addEntry(data)
    return { data, error }
  }

  const update = async (id, fields) => {
    const { data, error } = await supabase
      .from('entries')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) updateEntry(id, data)
    return { data, error }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (!error) removeEntry(id)
    return { error }
  }

  return { entries, loading, create, update, remove }
}
