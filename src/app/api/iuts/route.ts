// src/app/api/iuts/route.ts

import { NextResponse } from "next/server";
import { notionClient } from "@/lib/notion";
import { IUT } from "@/types";
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.NOTION_DATABASE_ID) {
      throw new Error("Missing NOTION_DATABASE_ID environment variable");
    }
    const databaseId = process.env.NOTION_DATABASE_ID;

    const allResults: PageObjectResponse[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response: QueryDatabaseResponse =
        await notionClient.databases.query({
          database_id: databaseId,
          // CORRECTION : Filtre supprimé pour TOUT récupérer
          sorts: [
            {
              property: "Statut",
              direction: "ascending",
            },
          ],
          start_cursor: startCursor,
        });

      const pageResults = response.results.filter(
        (page): page is PageObjectResponse => "properties" in page
      );
      allResults.push(...pageResults);

      hasMore = response.has_more;
      startCursor = response.next_cursor ?? undefined;
    }

    const iuts: IUT[] = allResults.map((page) => {
      const { properties } = page;

      // CORRECTION : Ajout de la lecture des `formationsCles`
      const formationsCles =
        properties["Formations Clés"]?.type === "multi_select"
          ? properties["Formations Clés"].multi_select
          : [];

      return {
        id: page.id,
        region:
          properties["REGION"]?.type === "title"
            ? properties["REGION"].title[0]?.plain_text
            : "Sans nom",
        ville:
          properties["Site/Ville"]?.type === "rich_text"
            ? properties["Site/Ville"].rich_text[0]?.plain_text
            : "Non précisé",
        statut:
          (properties["Statut"]?.type === "select"
            ? properties["Statut"].select?.name
            : undefined) ?? "Non défini",
        telephone:
          (properties["Téléphone"]?.type === "phone_number"
            ? properties["Téléphone"].phone_number
            : null) || undefined,
        url:
          (properties["URL Site Web"]?.type === "url"
            ? properties["URL Site Web"].url
            : null) || undefined,
        presenceBDE:
          (properties["Présence BDE?"]?.type === "checkbox"
            ? properties["Présence BDE?"].checkbox
            : false) || false,
        // Ajout du champ manquant dans l'objet retourné
        formationsCles: formationsCles,
      };
    });

    return NextResponse.json(iuts);
  } catch (error) {
    console.error("Failed to fetch IUTs:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
