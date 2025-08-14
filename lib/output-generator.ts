import type { DataStorage, OutputBlocks } from "./types"
import type { TournamentGroupingType } from "./tournament-grouping"

export function generateOutputBlocks(data: DataStorage, grouping?: TournamentGroupingType): OutputBlocks {
  const teams = data.teams

  // Generate team list (Block #1) - now supports multiple groups
  const teamsList = generateTeamsList(teams, grouping)

  // Generate emails list (Block #2)
  const emailsList = generateEmailsList(teams, grouping)

  // Generate tabular mapping (Block #3) - now supports multiple groups
  const tabularMapping = generateTabularMapping(teams, grouping)

  // Generate usernames list (Block #4)
  const usernamesList = generateUsernamesList(teams, grouping)

  return {
    teamsList,
    emailsList,
    tabularMapping,
    usernamesList,
  }
}

function generateTeamsList(teams: any[], grouping?: TournamentGroupingType): string {
  if (!grouping) {
    let output = "Block 1: Team List\n\n☄ GROUP A ☄\n\n"
    teams.forEach((team, index) => {
      if (team.team_name) {
        output += `${index + 1}. ${team.team_name}\n`
      }
    })
    return output.trim()
  }

  let output = "Block 1: Team List\n\n"
  grouping.groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) output += "\n\n"
    output += `☄ ${group.name.toUpperCase()} ☄\n\n`

    group.teams.forEach((team, teamIndex) => {
      const teamName = team.team_name || team.email || team.username || `Team ${teamIndex + 1}`
      output += `${teamIndex + 1}. ${teamName}\n`
    })
  })

  return output.trim()
}

function generateEmailsList(teams: any[], grouping?: TournamentGroupingType): string {
  if (!grouping) {
    const emails = teams.map((team) => team.email).filter((email) => email && email.trim())
    return `Block 2: Team Emails\n\nTeam Emails:\n${emails.join(", ")}`
  }

  let output = "Block 2: Team Emails\n\n"
  grouping.groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) output += "\n\n"
    const emails = group.teams.map((team) => team.email).filter((email) => email && email.trim())
    const groupLabel = group.name.toLowerCase().replace(/\s+/g, "-")
    output += `${groupLabel} Emails:\n${emails.join(", ")}`
  })

  return output.trim()
}

function generateTabularMapping(teams: any[], grouping?: TournamentGroupingType): string {
  if (!grouping) {
    let output = "Block 3: Tabular Mapping\n\n☄ GROUP A ☄\n"
    output += "Team Name\tEmail\n"
    const limitedTeams = teams.slice(0, 12)
    limitedTeams.forEach((team) => {
      const teamName = team.team_name || ""
      const email = team.email || ""
      output += `${teamName}\t${email}\n`
    })
    return output.trim()
  }

  let output = "Block 3: Tabular Mapping\n\n"
  grouping.groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) output += "\n\n"
    output += `☄ ${group.name.toUpperCase()} ☄\n`
    output += "Team Name\tEmail\n"

    group.teams.forEach((team) => {
      const teamName = team.team_name || team.email || team.username || ""
      const email = team.email || ""
      output += `${teamName}\t${email}\n`
    })
  })

  return output.trim()
}

function generateUsernamesList(teams: any[], grouping?: TournamentGroupingType): string {
  if (!grouping) {
    const usernames = teams.map((team) => team.username).filter((username) => username && username.trim())
    return `Block 4: Team Usernames\n\nTeam Usernames:\n${usernames.join(", ")}`
  }

  let output = "Block 4: Team Usernames\n\n"
  grouping.groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) output += "\n\n"
    const usernames = group.teams.map((team) => team.username).filter((username) => username && username.trim())
    const groupLabel = group.name.toLowerCase().replace(/\s+/g, "-")
    output += `${groupLabel} Usernames:\n${usernames.join(", ")}`
  })

  return output.trim()
}

export function formatOutputBlocksAsText(blocks: OutputBlocks): string {
  return `\`\`\`
${blocks.teamsList}
\`\`\`

\`\`\`
${blocks.emailsList}
\`\`\`

\`\`\`
${blocks.tabularMapping}
\`\`\`

\`\`\`
${blocks.usernamesList}
\`\`\``
}
