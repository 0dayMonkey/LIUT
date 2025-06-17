// src/components/IUTCard.tsx
"use client";
import { IUT } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";

interface IUTCardProps {
  iut: IUT;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function IUTCard({ iut }: IUTCardProps) {
  return (
    <motion.div variants={cardVariants}>
      <Link href={`/iut/${iut.id}`}>
        <div className="w-full cursor-pointer rounded-lg bg-gray-800 p-4 shadow-lg transition-all hover:bg-gray-700 hover:scale-[1.02]">
          <h3 className="truncate text-lg font-semibold text-white">
            {iut.region || "Sans région"}
          </h3>
          <p className="text-sm text-gray-400">{iut.ville}</p>
        </div>
      </Link>
    </motion.div>
  );
}
