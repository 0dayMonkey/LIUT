// src/types/index.ts
export interface IUT {
  id: string;
  region: string;
  ville: string;
  statut: string;
  telephone?: string;
  url?: string;
  notes?: string;
  email?: string; // Ajout du champ email
}

export interface UpdateIutPayload {
  statut?: string;
  notes?: string;
  email?: string;
  dateDeContact?: boolean;
}
