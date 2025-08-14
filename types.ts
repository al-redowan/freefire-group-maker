
export interface Team {
  id: number;
  name: string;
  leaderWhatsapp: string;
  email: string;
}

export type SortKey = keyof Omit<Team, 'id'>;

export interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}
