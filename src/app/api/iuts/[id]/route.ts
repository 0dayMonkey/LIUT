// src/app/api/iuts/[id]/route.ts

import { notionClient } from "@/lib/notion";
import { IUT, UpdateIutPayload } from "@/types";
import {
  PageObjectResponse,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { NextResponse } from "next/server";

// La fonction mapNotionPageToIUT reste inchangée
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
    email:
      (props["Email"]?.type === "email" ? props["Email"].email : null) ||
      undefined,
    presenceBDE:
      (props["Présence BDE?"]?.type === "checkbox"
        ? props["Présence BDE?"].checkbox
        : false) || false,
  };
}

// La fonction GET reste inchangée
export async function GET(
  request: Request,
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

// ===== CORRECTION FINALE APPLIQUÉE ICI =====
// La fonction PATCH est simplifiée pour ne renvoyer qu'un statut de succès.
// La mise à jour de l'état est gérée par le frontend.
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id;
    const {
      statut,
      notes,
      email,
      dateDeContact,
      presenceBDE,
    }: UpdateIutPayload = await req.json();

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
    if (presenceBDE !== undefined) {
      propertiesToUpdate["Présence BDE?"] = { checkbox: presenceBDE };
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
