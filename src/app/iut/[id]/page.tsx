"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { IUT, UpdateIutPayload } from "@/types";
import {
  Phone,
  Globe,
  ArrowLeft,
  Save,
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { AnimatePresence, motion } from "framer-motion";

async function getIutDetails(id: string): Promise<IUT> {
  const res = await fetch(`/api/iuts/${id}`);
  if (!res.ok) throw new Error("Impossible de charger les détails.");
  return res.json();
}

async function updateIut({
  id,
  payload,
}: {
  id: string;
  payload: UpdateIutPayload;
}) {
  const res = await fetch(`/api/iuts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "La mise à jour a échoué.");
  }
  return res.json();
}

export default function IUTDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");

  const {
    data: iut,
    isLoading,
    isError,
    error,
  } = useQuery<IUT, Error>({
    queryKey: ["iut", id],
    queryFn: () => getIutDetails(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (iut) {
      setNotes(iut.notes || "");
      setEmail(iut.email || "");
    }
  }, [iut]);

  const mutation = useMutation({
    mutationFn: updateIut,
    onSuccess: (_, variables) => {
      let msg = "Mise à jour réussie !";
      if (variables.payload.statut) msg = "Statut mis à jour !";
      if (variables.payload.notes !== undefined) msg = "Notes enregistrées !";
      if (variables.payload.email !== undefined) msg = "Email enregistré !";
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["iuts"] });
      queryClient.invalidateQueries({ queryKey: ["iut", id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleAction = (payload: UpdateIutPayload) =>
    mutation.mutate({ id, payload });
  const isSavingNotes =
    mutation.isPending && mutation.variables?.payload.notes !== undefined;

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  if (isError)
    return (
      <div className="p-4 text-red-500 text-center">
        Erreur: {error?.message}
      </div>
    );

  const WorkflowActions = () => {
    switch (iut?.statut) {
      case "📞 À appeler":
        return (
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-card">
              <label htmlFor="email" className="font-semibold text-foreground">
                Email de contact obtenu
              </label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="contact@iut-exemple.fr"
                className="input"
              />
            </div>
            <button
              onClick={() =>
                handleAction({ email, statut: "📧 Mail à envoyer" })
              }
              disabled={!email || mutation.isPending}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              Enregistrer & Préparer le mail
            </button>
          </div>
        );
      case "📧 Mail à envoyer":
        return (
          <button
            onClick={() =>
              handleAction({
                statut: "💬 En attente de réponse",
                dateDeContact: true,
              })
            }
            disabled={mutation.isPending}
            className="btn btn-primary w-full"
          >
            <Send size={16} className="mr-2" />
            Marquer "Mail Envoyé"
          </button>
        );
      case "💬 En attente de réponse":
        return (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                handleAction({ statut: "✅ Terminé (Info obtenu)" })
              }
              className="btn btn-success"
            >
              <CheckCircle size={16} className="mr-2" />
              Info Obtenu
            </button>
            <button
              onClick={() =>
                handleAction({ statut: "❌ Clôturé (Sans réponse/refus)" })
              }
              className="btn btn-danger"
            >
              <XCircle size={16} className="mr-2" />
              Clôturer
            </button>
          </div>
        );
      default:
        return (
          <p className="text-center text-muted-foreground py-4">
            Statut actuel : {iut?.statut}
          </p>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-md p-4 min-h-screen">
        <header className="flex items-center justify-between mb-8 pt-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-muted"
          >
            <ArrowLeft size={24} />
          </button>
          <ThemeSwitcher />
        </header>

        <div className="space-y-8">
          <div className="text-center space-y-1">
            <h1 className="text-3xl">{iut?.region}</h1>
            <p className="text-muted-foreground">{iut?.ville}</p>
          </div>

          <div className="info-card">
            <a href={`tel:${iut?.telephone}`} className="info-card-row">
              <Phone size={20} className="info-card-icon" />
              <span>{iut?.telephone || "Non renseigné"}</span>
            </a>
            <a
              href={iut?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="info-card-row"
            >
              <Globe size={20} className="info-card-icon" />
              <span className="truncate">{iut?.url || "Non renseigné"}</span>
            </a>
            <div className="flex items-center space-x-4">
              <Mail size={20} className="info-card-icon" />
              <span>{iut?.email || "Non renseigné"}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={iut?.statut}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <WorkflowActions />
            </motion.div>
          </AnimatePresence>

          <div className="info-card">
            <label htmlFor="notes" className="font-semibold">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="input"
              placeholder="Infos de contact, remarques..."
            />
            <button
              onClick={() => handleAction({ notes })}
              disabled={mutation.isPending || notes === iut?.notes}
              className="btn btn-primary w-full mt-3 disabled:opacity-50"
            >
              {isSavingNotes ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {isSavingNotes ? "Sauvegarde..." : "Enregistrer les notes"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
