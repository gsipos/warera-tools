import { WarEra } from 'warera-api'

export const ecoSkills: WarEra.SkillKey[] = ['companies', 'enterpreneurship', 'energy', 'production']

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
