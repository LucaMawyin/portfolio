import { getDB } from "@/lib/db";
import CreateExperiencePage from "../CreateExperiencePage";
import { getTags } from "@/lib/tags";
import { Tag } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const sp = await searchParams;

    const id = sp?.id ? Number(sp.id) : null;

    let draft = null;

    const db = await getDB();

    // Fetching draft
    if (id) {
        draft = await db
        .prepare(`
            SELECT * FROM experience
            WHERE id = ?
        `)
        .bind(id)
        .first();
    }

    // No draft exists
    if (!draft) {
        redirect("/add-experience");
    }

    const [tags, headersList] = await Promise.all([
        getTags("experience"),
        headers(),
    ]);

    const data = draft;

    const referrer = headersList.get("referer")
        ? new URL(headersList.get("referer")!).pathname
        : null;

    return (
        <CreateExperiencePage
            initialData={{ ...data }}
            tags={tags as Tag[]}
            referrer={referrer}
        />
    );
}