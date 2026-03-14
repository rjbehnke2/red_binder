import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRitualsStore } from '../store/ritualsStore'
import { useUser } from '../lib/auth'

/** Returns today's date as YYYY-MM-DD in local time */
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function computeStreak(rituals) {
  const dailyDates = [
    ...new Set(
      rituals
        .filter((r) => r.ritual_type === 'daily')
        .map((r) => r.completed_at.slice(0, 10))
    ),
  ].sort().reverse()

  if (dailyDates.length === 0) return 0

  const today = todayStr()
  const prev = new Date()
  prev.setDate(prev.getDate() - 1)
  const yesterdayStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`

  if (dailyDates[0] !== today && dailyDates[0] !== yesterdayStr) return 0

  let streak = 0
  let expected = dailyDates[0]
  for (const date of dailyDates) {
    if (date === expected) {
      streak++
      const d = new Date(expected + 'T00:00:00')
      d.setDate(d.getDate() - 1)
      expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } else {
      break
    }
  }
  return streak
}

export function useRituals() {
  const user = useUser()
  const {
    rituals, setRituals, addRitual,
    setStreak, setCompletedToday,
    activeRitual, currentStep, ritualData,
    setActiveRitual, clearActiveRitual, nextStep, prevStep, setRitualData,
    completedTodayDaily, completedTodayWeekly, streak,
  } = useRitualsStore()

  useEffect(() => {
    if (!user) return
    supabase
      .from('rituals')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(90)
      .then(({ data, error }) => {
        if (error || !data) return
        setRituals(data)
        setStreak(computeStreak(data))
        const today = todayStr()
        setCompletedToday('daily', data.some(
          (r) => r.ritual_type === 'daily' && r.completed_at.slice(0, 10) === today
        ))
        setCompletedToday('weekly', data.some(
          (r) => r.ritual_type === 'weekly' && r.completed_at.slice(0, 10) === today
        ))
      })
  }, [user?.id])

  const complete = async ({ ritual_type, entry_id, response_data }) => {
    const { data, error } = await supabase
      .from('rituals')
      .insert({ user_id: user.id, ritual_type, entry_id: entry_id ?? null, response_data })
      .select()
      .single()
    if (error) return { error }
    addRitual(data)
    const updated = [data, ...rituals]
    setStreak(computeStreak(updated))
    setCompletedToday(ritual_type, true)
    return { data, error: null }
  }

  return {
    rituals, streak, completedTodayDaily, completedTodayWeekly,
    activeRitual, currentStep, ritualData,
    setActiveRitual, clearActiveRitual, nextStep, prevStep, setRitualData,
    complete,
  }
}
