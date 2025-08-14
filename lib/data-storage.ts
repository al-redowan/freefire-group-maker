import { promises as fs } from "fs"
import path from "path"
import type { DataStorage, TeamData } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "data.json")

export async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

export async function loadData(): Promise<DataStorage> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(DATA_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    // Return empty data structure if file doesn't exist
    return {
      teams: [],
      created_at: new Date().toISOString(),
      uploaded_files: [],
    }
  }
}

export async function saveData(data: DataStorage): Promise<void> {
  await ensureDataDirectory()

  // Atomic write: write to temp file then rename
  const tempFile = `${DATA_FILE}.tmp`
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf-8")
  await fs.rename(tempFile, DATA_FILE)
}

export async function mergeTeamData(
  existingData: DataStorage,
  newTeams: Omit<TeamData, "source_file">[],
  sourceFile: string,
): Promise<DataStorage> {
  const emailMap = new Map<string, TeamData>()
  const usernameMap = new Map<string, TeamData>()
  const teamNameMap = new Map<string, TeamData>()

  // Index existing teams by email, username, and team name
  existingData.teams.forEach((team) => {
    if (team.email) emailMap.set(team.email.toLowerCase(), team)
    if (team.username) usernameMap.set(team.username.toLowerCase(), team)
    if (team.team_name) teamNameMap.set(team.team_name.toLowerCase(), team)
  })

  const mergedTeams = [...existingData.teams]
  const uploadedFiles = [...existingData.uploaded_files]

  if (!uploadedFiles.includes(sourceFile)) {
    uploadedFiles.push(sourceFile)
  }

  // Process new teams with deduplication priority: email > username > team name
  newTeams.forEach((newTeam) => {
    const teamWithSource: TeamData = { ...newTeam, source_file: sourceFile }

    let existingTeam: TeamData | undefined

    // Check for duplicates in priority order
    if (newTeam.email) {
      existingTeam = emailMap.get(newTeam.email.toLowerCase())
    }

    if (!existingTeam && newTeam.username) {
      existingTeam = usernameMap.get(newTeam.username.toLowerCase())
    }

    if (!existingTeam && newTeam.team_name) {
      existingTeam = teamNameMap.get(newTeam.team_name.toLowerCase())
    }

    if (existingTeam) {
      // Update existing team with new data (prefer non-empty values)
      const index = mergedTeams.findIndex((t) => t === existingTeam)
      if (index !== -1) {
        mergedTeams[index] = {
          team_name: newTeam.team_name || existingTeam.team_name,
          email: newTeam.email || existingTeam.email,
          username: newTeam.username || existingTeam.username,
          source_file: existingTeam.source_file, // Keep original source
        }
      }
    } else {
      // Add new team
      mergedTeams.push(teamWithSource)

      // Update maps
      if (newTeam.email) emailMap.set(newTeam.email.toLowerCase(), teamWithSource)
      if (newTeam.username) usernameMap.set(newTeam.username.toLowerCase(), teamWithSource)
      if (newTeam.team_name) teamNameMap.set(newTeam.team_name.toLowerCase(), teamWithSource)
    }
  })

  return {
    teams: mergedTeams,
    created_at: existingData.created_at,
    uploaded_files: uploadedFiles,
  }
}
