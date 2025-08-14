export interface TeamData {
  team_name: string
  email: string
  username: string
  source_file: string
}

export interface DataStorage {
  teams: TeamData[]
  created_at: string
  uploaded_files: string[]
}

export interface ParsedFileData {
  teams: Omit<TeamData, "source_file">[]
  filename: string
  rowCount: number
  duplicatesRemoved: number
}

export interface OutputBlocks {
  teamsList: string
  emailsList: string
  tabularMapping: string
  usernamesList: string
}

export interface UploadResponse {
  success: boolean
  message: string
  parsedData?: ParsedFileData
  totalTeams?: number
}

export interface TournamentGroup {
  name: string
  teams: TeamData[]
}

export interface TournamentGrouping {
  groups: TournamentGroup[]
  totalTeams: number
  teamsPerGroup: number
  algorithm: "balanced" | "random" | "sequential"
}
