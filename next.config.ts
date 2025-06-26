// Fichier : next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AJOUT DE L'OPTION POUR IGNORER LES ERREURS TYPESCRIPT
  typescript: {
    // !! ATTENTION !!
    // Permet dangereusement aux builds de production de réussir même si
    // votre projet a des erreurs de type.
    ignoreBuildErrors: true,
  },

  // VOTRE CONFIGURATION CORS EXISTANTE
  async headers() {
    return [
      {
        // Appliquer ces en-têtes à toutes les routes API
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Autorise n'importe quelle origine
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
