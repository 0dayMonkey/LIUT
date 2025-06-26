// src/types/index.ts
export interface IUT {
  id: string;
  region: string;
  ville: string;
  statut: string;
  telephone?: string;
  url?: string;
  notes?: string;
  email?: string;
<<<<<<< HEAD
  presenceBDE?: boolean;
  autresAssos?: string;
  formationsCles?: { name: string; color: string }[];
  interlocuteur?: string;
  dateDeContact?: string;
=======
  presenceBDE?: boolean; // <-- AJOUTER CECI
>>>>>>> 07b03e530063d0e6b4b918973b59be628bf7e42a
}

export interface UpdateIutPayload {
  statut?: string;
  notes?: string;
  email?: string;
  dateDeContact?: boolean;
<<<<<<< HEAD
  presenceBDE?: boolean;
=======
  presenceBDE?: boolean; // <-- AJOUTER CECI
>>>>>>> 07b03e530063d0e6b4b918973b59be628bf7e42a
}
