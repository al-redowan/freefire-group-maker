import type { TeamData } from "./types"

export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ")
}

export function isEmail(text: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(text)
}

export function isTimestamp(text: string): boolean {
  // Check for various timestamp formats
  const timestampPatterns = [
    /^\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}:\d{2}\s+(am|pm)\s+GMT[+-]\d+$/i,
    /^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}$/,
    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/,
    /^\d{1,2}-\d{1,2}-\d{4}$/,
  ]
  return timestampPatterns.some((pattern) => pattern.test(text.trim()))
}

export function isConfirmation(text: string): boolean {
  const confirmationWords = ["yes", "no", "true", "false", "confirmed", "pending"]
  return confirmationWords.includes(text.toLowerCase().trim())
}

export function isListMarker(text: string): boolean {
  const listMarkerPatterns = [
    /^\d+\.\s*$/, // "1.", "2.", etc.
    /^\*\s*$/, // "*"
    /^-\s*$/, // "-"
    /^•\s*$/, // "•"
    /^>\s*$/, // ">"
    /^group\s+[a-z]\s*$/i, // "Group A", "Group B", etc.
    /^team\s+\d+\s*$/i, // "Team 1", "Team 2", etc.
    /^round\s+\d+\s*$/i, // "Round 1", "Round 2", etc.
  ]
  return listMarkerPatterns.some((pattern) => pattern.test(text.trim()))
}

export function removeListMarkers(text: string): string {
  return text
    .replace(/^\d+\.\s*/, "") // Remove "1. ", "2. ", etc.
    .replace(/^\*\s*/, "") // Remove "* "
    .replace(/^-\s*/, "") // Remove "- "
    .replace(/^•\s*/, "") // Remove "• "
    .replace(/^>\s*/, "") // Remove "> "
    .trim()
}

export function detectColumnTypes(headers: string[]): {
  teamNameIndex: number
  emailIndex: number
  whatsappIndex: number
  usernameIndex: number
} {
  let teamNameIndex = -1
  let emailIndex = -1
  let whatsappIndex = -1
  let usernameIndex = -1

  headers.forEach((header, index) => {
    const lowerHeader = header.toLowerCase().trim()

    // Team name detection
    if (lowerHeader.includes("team") && lowerHeader.includes("name")) {
      teamNameIndex = index
    } else if (lowerHeader === "team" || lowerHeader === "name" || lowerHeader === "team_name") {
      teamNameIndex = index
    }

    // Email detection
    if (lowerHeader.includes("email") || lowerHeader.includes("mail")) {
      emailIndex = index
    }

    // WhatsApp detection
    if (
      lowerHeader.includes("whatsapp") ||
      lowerHeader.includes("whats app") ||
      lowerHeader.includes("phone") ||
      lowerHeader.includes("mobile") ||
      lowerHeader.includes("contact") ||
      lowerHeader.includes("number")
    ) {
      whatsappIndex = index
    }

    // Username detection
    if (
      lowerHeader.includes("username") ||
      lowerHeader.includes("user") ||
      lowerHeader.includes("handle") ||
      lowerHeader.includes("id")
    ) {
      usernameIndex = index
    }
  })

  return { teamNameIndex, emailIndex, whatsappIndex, usernameIndex }
}

export function parseCSV(content: string, filename: string): Omit<TeamData, "source_file">[] {
  const lines = content.split("\n").filter((line) => line.trim())
  if (lines.length === 0) return []

  const teams: Omit<TeamData, "source_file">[] = []

  // Try to detect if first line is header
  const firstLine = lines[0]
  const hasHeader =
    firstLine.toLowerCase().includes("team") ||
    firstLine.toLowerCase().includes("email") ||
    firstLine.toLowerCase().includes("whatsapp") ||
    firstLine.toLowerCase().includes("name")

  let columnMapping = { teamNameIndex: -1, emailIndex: -1, whatsappIndex: -1, usernameIndex: -1 }

  if (hasHeader) {
    const headerColumns = firstLine.split(/[,;\t|]/).map((col) => normalizeText(col.replace(/^["']|["']$/g, "")))
    columnMapping = detectColumnTypes(headerColumns)
  }

  const dataLines = hasHeader ? lines.slice(1) : lines

  dataLines.forEach((line) => {
    // Handle different CSV separators
    const separators = [",", ";", "\t", "|"]
    let columns: string[] = []

    for (const sep of separators) {
      const testColumns = line.split(sep).map((col) => normalizeText(col.replace(/^["']|["']$/g, "")))
      if (testColumns.length > columns.length) {
        columns = testColumns
      }
    }

    if (columns.length <= 1) {
      // Split by multiple spaces or tabs, but keep single spaces within names
      const parts = line.split(/\s{2,}|\t/).map((part) => normalizeText(part))
      if (parts.length > 1) {
        columns = parts
      } else {
        // Try to extract from timestamp + name + email + confirmation pattern
        const timestampMatch = line.match(
          /^(.*?\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}:\d{2}\s+(?:am|pm)\s+GMT[+-]\d+)(.*)/i,
        )
        if (timestampMatch) {
          const afterTimestamp = timestampMatch[2].trim()
          // Split the remaining part to get team name, email, confirmation
          const remainingParts = afterTimestamp.split(/\s+/)
          columns = [timestampMatch[1], ...remainingParts]
        }
      }
    }

    if (columns.length === 0) return

    let teamName = ""
    let email = ""
    let username = ""

    if (
      hasHeader &&
      (columnMapping.teamNameIndex >= 0 || columnMapping.emailIndex >= 0 || columnMapping.whatsappIndex >= 0)
    ) {
      // Use detected column positions
      if (columnMapping.teamNameIndex >= 0 && columns[columnMapping.teamNameIndex]) {
        teamName = columns[columnMapping.teamNameIndex]
      }
      if (columnMapping.emailIndex >= 0 && columns[columnMapping.emailIndex]) {
        email = columns[columnMapping.emailIndex]
      }
      if (columnMapping.whatsappIndex >= 0 && columns[columnMapping.whatsappIndex]) {
        username = columns[columnMapping.whatsappIndex]
      }
      if (columnMapping.usernameIndex >= 0 && columns[columnMapping.usernameIndex]) {
        username = username || columns[columnMapping.usernameIndex]
      }
    } else {
      // Fallback to smart detection
      columns.forEach((col, index) => {
        if (!col) return

        // Skip timestamps and confirmations
        if (isTimestamp(col) || isConfirmation(col)) {
          return
        }

        if (isEmail(col)) {
          if (!email) email = col
        } else if (col.length > 2 && !teamName && !isTimestamp(col)) {
          teamName = col
        } else if (!username && col !== teamName && !isEmail(col)) {
          username = col
        }
      })
    }

    if (!teamName && email) {
      teamName = email.split("@")[0]
    }

    if (teamName || email || username) {
      teams.push({
        team_name: teamName,
        email: email,
        username: username || email || teamName, // Use email as username if no separate username
      })
    }
  })

  return teams
}

export function parseTXT(content: string, filename: string): Omit<TeamData, "source_file">[] {
  const lines = content
    .split("\n")
    .map((line) => normalizeText(line))
    .filter((line) => line.length > 0)

  const teams: Omit<TeamData, "source_file">[] = []

  lines.forEach((line) => {
    if (isListMarker(line)) {
      return // Skip pure list markers
    }

    // Remove list markers from the beginning of the line
    const cleanedLine = removeListMarkers(line)
    if (!cleanedLine) return

    // Check if line contains multiple fields separated by common delimiters
    const separators = ["\t", ",", ";", "|", "  "] // Double space as separator
    let columns: string[] = [cleanedLine]

    for (const sep of separators) {
      if (cleanedLine.includes(sep)) {
        columns = cleanedLine
          .split(sep)
          .map((col) => normalizeText(col))
          .filter((col) => col)
        break
      }
    }

    let teamName = ""
    let email = ""
    let username = ""

    if (columns.length === 1) {
      // Single field - could be team name, email, or username
      const field = columns[0]
      if (isEmail(field)) {
        email = field
        username = field
      } else {
        teamName = field
      }
    } else {
      // Multiple fields - smart detection
      columns.forEach((col) => {
        if (isEmail(col)) {
          if (!email) email = col
        } else if (col.length > 2 && !teamName) {
          teamName = col
        } else if (!username && col !== teamName) {
          username = col
        }
      })
    }

    if (teamName || email || username) {
      teams.push({
        team_name: teamName,
        email: email,
        username: username || email || teamName,
      })
    }
  })

  return teams
}

export function parseFile(content: string, filename: string): Omit<TeamData, "source_file">[] {
  const extension = filename.toLowerCase().split(".").pop()

  if (extension === "csv") {
    return parseCSV(content, filename)
  } else if (extension === "txt") {
    return parseTXT(content, filename)
  } else {
    // Try CSV parsing as fallback
    return parseCSV(content, filename)
  }
}
