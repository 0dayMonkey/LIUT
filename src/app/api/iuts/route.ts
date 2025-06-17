// src/app/api/iuts/route.ts

import { NextResponse } from "next/server";
import { notionClient } from "@/lib/notion";
import { IUT } from "@/types";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.NOTION_DATABASE_ID) {
      throw new Error("Missing NOTION_DATABASE_ID environment variable");
    }
    const databaseId = process.env.NOTION_DATABASE_ID;

    const response = await notionClient.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: "Statut",
            select: {
              does_not_equal: "✅ Terminé (Contact obtenu)",
            },
          },
          {
            property: "Statut",
            select: {
              does_not_equal: "❌ Clôturé (Sans réponse/refus)",
            },
          },
        ],
      },
      sorts: [
        {
          property: "Statut",
          direction: "ascending",
        },
      ],
    });

    const fullPages = response.results.filter(
      (page): page is PageObjectResponse => "properties" in page
    );

    const iuts: IUT[] = fullPages.map((page) => {
      const { properties } = page;

      const region =
        properties["REGION"]?.type === "title"
          ? properties["REGION"].title[0]?.plain_text
          : "Sans nom";

      const ville =
        properties["Site/Ville"]?.type === "rich_text"
          ? properties["Site/Ville"].rich_text[0]?.plain_text
          : "Non précisé";

      const statut =
        (properties["Statut"]?.type === "select"
          ? properties["Statut"].select?.name
          : undefined) ?? "Non défini";

      // ===== LES LIGNES CORRIGÉES SONT ICI =====
      const telephone =
        (properties["Téléphone"]?.type === "phone_number"
          ? properties["Téléphone"].phone_number
          : null) || undefined;

      const url =
        (properties["URL Site Web"]?.type === "url"
          ? properties["URL Site Web"].url
          : null) || undefined;
      // ==========================================

      return { id: page.id, region, ville, statut, telephone, url };
    });

    return NextResponse.json(iuts);
  } catch (error) {
    console.error("Failed to fetch IUTs:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
