import { notionClient } from "@/lib/notion";
import { IUT, UpdateIutPayload } from "@/types";
import {
  PageObjectResponse,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { NextResponse } from "next/server";

// Fonction pour mapper les données brutes de Notion à notre type IUT propre
function mapNotionPageToIUT(page: PageObjectResponse): IUT {
  const props = page.properties;
  return {
    id: page.id,
    region:
      props["REGION"]?.type === "title"
        ? props["REGION"].title[0]?.plain_text
        : "Sans région",
    ville:
      props["Site/Ville"]?.type === "rich_text"
        ? props["Site/Ville"].rich_text[0]?.plain_text
        : "Non précisé",
    // CORRECTION : On s'assure que statut est toujours une string
    statut:
      (props["Statut"]?.type === "select"
        ? props["Statut"].select?.name
        : undefined) ?? "Non défini",
    telephone:
      (props["Téléphone"]?.type === "phone_number"
        ? props["Téléphone"].phone_number
        : null) || undefined,
    url:
      (props["URL Site Web"]?.type === "url"
        ? props["URL Site Web"].url
        : null) || undefined,
    notes:
      props["Notes"]?.type === "rich_text"
        ? props["Notes"].rich_text[0]?.plain_text
        : "",
    // CORRECTION : On s'assure que email n'est jamais null
    email:
      (props["Email"]?.type === "email" ? props["Email"].email : null) ||
      undefined,
  };
}

/**
 * Gère la récupération des détails d'un IUT spécifique.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id;
    if (!pageId) {
      return NextResponse.json({ message: "Missing page ID" }, { status: 400 });
    }

    const response = await notionClient.pages.retrieve({ page_id: pageId });

    if (response.object !== "page" || !("properties" in response)) {
      throw new Error("Invalid page response from Notion");
    }

    const iut = mapNotionPageToIUT(response);
    return NextResponse.json(iut);
  } catch (error) {
    console.error("Error in GET /api/iuts/[id]:", error);
    return NextResponse.json(
      { message: "Error fetching IUT details" },
      { status: 500 }
    );
  }
}

/**
 * Gère la mise à jour d'un IUT (statut, notes, email, etc.).
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id;
    const { statut, notes, email, dateDeContact }: UpdateIutPayload =
      await req.json();

    const propertiesToUpdate: UpdatePageParameters["properties"] = {};

    if (statut) {
      propertiesToUpdate.Statut = { select: { name: statut } };
    }
    if (notes !== undefined) {
      propertiesToUpdate.Notes = { rich_text: [{ text: { content: notes } }] };
    }
    if (email !== undefined) {
      propertiesToUpdate.Email = { email: email || null };
    }
    if (dateDeContact) {
      propertiesToUpdate["Date du contact"] = {
        date: { start: new Date().toISOString() },
      };
    }

    if (Object.keys(propertiesToUpdate).length === 0) {
      return NextResponse.json(
        { message: "No properties to update" },
        { status: 400 }
      );
    }

    await notionClient.pages.update({
      page_id: pageId,
      properties: propertiesToUpdate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/iuts/[id]:", error);
    return NextResponse.json(
      { message: "Error updating IUT" },
      { status: 500 }
    );
  }
}
