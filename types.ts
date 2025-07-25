
export interface TeamRegistration {
  timestamp: string;
  username: string;
  joinedWhatsApp: string;
  teamName: string;
  leaderWhatsApp: string;
  email: string;
}

export interface AnalysisResult {
  commonThemes: string[];
  mostCreativeNames: string[];
  analysisSummary: string;
}

export interface Group {
    name: string;
    teams: TeamRegistration[];
}
