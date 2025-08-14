import type { TeamData } from "./types"

export interface TournamentGroup {
  id: string
  name: string
  teams: TeamData[]
}

export interface TournamentGrouping {
  groups: TournamentGroup[]
  totalTeams: number
  groupSize: number
  algorithm: "balanced" | "random" | "sequential"
}

export function generateTournamentGroups(
  teams: TeamData[],
  numberOfGroups = 4,
  algorithm: "balanced" | "random" | "sequential" = "balanced",
): TournamentGrouping {
  if (teams.length === 0) {
    return {
      groups: [],
      totalTeams: 0,
      groupSize: 0,
      algorithm,
    }
  }

  // Initialize groups
  const groups: TournamentGroup[] = []
  const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"]

  for (let i = 0; i < numberOfGroups; i++) {
    groups.push({
      id: `group-${groupNames[i]}`,
      name: `Group ${groupNames[i]}`,
      teams: [],
    })
  }

  // Copy teams array to avoid mutation
  let teamsCopy = [...teams]

  // Apply algorithm
  switch (algorithm) {
    case "random":
      teamsCopy = shuffleArray(teamsCopy)
      break
    case "sequential":
      // Keep original order
      break
    case "balanced":
    default:
      teamsCopy = shuffleArray(teamsCopy)
      break
  }

  // Distribute teams across groups
  teamsCopy.forEach((team, index) => {
    const groupIndex = index % numberOfGroups
    groups[groupIndex].teams.push(team)
  })

  const groupSize = Math.ceil(teams.length / numberOfGroups)

  return {
    groups,
    totalTeams: teams.length,
    groupSize,
    algorithm,
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function formatGroupsAsText(grouping: TournamentGrouping): string {
  let output = `Tournament Groups (${grouping.algorithm} distribution)\n`
  output += `Total Teams: ${grouping.totalTeams}\n`
  output += `Groups: ${grouping.groups.length}\n\n`

  grouping.groups.forEach((group) => {
    output += `☄ GROUP ${group.name.split(" ")[1]} ☄\n`
    group.teams.forEach((team, index) => {
      output += `${index + 1}. ${team.team_name || team.email || team.username}\n`
    })
    output += `\n`
  })

  return output.trim()
}
