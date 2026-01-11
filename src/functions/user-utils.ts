import { DateTime } from 'luxon'
import { WarEra } from 'warera-api'

export const ecoSkills: WarEra.SkillKey[] = ['companies', 'enterpreneurship', 'energy', 'production', 'management']

const toSum = (a: number, b: number) => a + b
export const getUserEcoSkillLevels = (user: WarEra.UserLite) =>
  Object.entries(user.skills)
    .filter(([k]) => ecoSkills.includes(k as WarEra.SkillKey))
    .map(([, value]) => value.level)
    .reduce(toSum, 0)

export const getUserCombatSkillLevels = (user: WarEra.UserLite) =>
  Object.entries(user.skills)
    .filter(([k]) => !ecoSkills.includes(k as WarEra.SkillKey))
    .map(([, value]) => value.level)
    .reduce(toSum, 0)

export const getUserRespecDetails = (user: WarEra.UserLite) => {
  const lastRespec = user.dates?.lastSkillsResetAt
  const nextPossibleRespecDate = DateTime.fromISO(lastRespec).plus({ days: 7 })
  const canRespec = lastRespec
    ? DateTime.now().toMillis() >= nextPossibleRespecDate.toMillis()
    : !!user.leveling.freeReset
  const timeUntilRespec = nextPossibleRespecDate.diffNow(['days', 'hours'])

  return { canRespec, timeUntilRespec }
}
