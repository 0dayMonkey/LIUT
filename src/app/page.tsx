// src/app/page.tsx
"use client";

// src/app/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IUT } from "@/types";
import IUTCard from "@/components/IUTCard";
import SegmentedControl from "@/components/SegmentedControl";
import SkeletonLoader from "@/components/SkeletonLoader";
import { motion } from "framer-motion";

async function getIuts(): Promise<IUT[]> {
  const res = await fetch("/api/iuts");
  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des données");
  }
  return res.json();
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("À relancer");

  const {
    data: iuts,
    isLoading,
    isError,
  } = useQuery<IUT[]>({
    queryKey: ["iuts"],
    queryFn: getIuts,
  });

  const filteredLists = useMemo(() => {
    const aRelancer =
      iuts?.filter((iut) => iut.statut === "❗️ À relancer") ?? [];
    const aContacter =
      iuts?.filter((iut) => iut.statut === "📞 À appeler") ?? [];
    return { aRelancer, aContacter };
  }, [iuts]);

  const tabs = [
    { name: "À relancer", count: filteredLists.aRelancer.length },
    { name: "À contacter", count: filteredLists.aContacter.length },
  ];

  const currentList =
    activeTab === "À relancer"
      ? filteredLists.aRelancer
      : filteredLists.aContacter;

  return (
    <main className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-6 text-center text-3xl font-bold">IUT Outreach</h1>

        <div className="mb-6">
          <SegmentedControl
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {isLoading && <SkeletonLoader />}
        {isError && (
          <p className="text-center text-red-500">
            Erreur de chargement des données.
          </p>
        )}

        {iuts && (
          <motion.div
            key={activeTab} // Changer la clé force l'animation au changement d'onglet
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="space-y-3"
          >
            {currentList.length > 0 ? (
              currentList.map((iut) => <IUTCard key={iut.id} iut={iut} />)
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-8 text-center text-gray-500"
              >
                Rien à faire dans cette section. Bravo !
              </motion.p>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
