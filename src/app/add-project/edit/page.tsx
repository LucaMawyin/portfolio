import { getDB } from "@/lib/db";
import CreateProjectPage from "../CreateProjectPage";
import { getTags } from "@/lib/tags";
import { Project, Tag } from "@/lib/types";
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

    // Getting tag & status for project
    if (id) {
        draft = await db
        .prepare(`
            SELECT 
                p.*, 
                project_tag.colour AS colour,
                status_tag.colour AS status_colour
            FROM projects p
            LEFT JOIN tags project_tag 
                ON project_tag.name = p.tag 
                AND project_tag.category = 'project'
            LEFT JOIN tags status_tag 
                ON status_tag.name = p.status
                AND status_tag.category = 'status'
            WHERE p.id = ?
            AND p.deleted = 0
        `)
        .bind(id)
        .first();
    }

    // No draft exists
    if (!draft) {
        redirect("/add-project");
    }

    const [tags , statuses, headersList] = await Promise.all([
        getTags("project"),
        getTags("status"),
        headers(),
    ]);

    const data = draft as Project;

    const imageUrl = data?.id
        ? `/images/projects/${data.id}?v=${encodeURIComponent(data.updated_at)}`
        : null;

    const referrer = headersList.get("referer")
        ? new URL(headersList.get("referer")!).pathname
        : null;

    return (
        <CreateProjectPage
            initialData={{ ...data, imageUrl }}
            tags={tags as Tag[]}
            statuses={statuses as Tag[]}
            referrer={referrer}
        />
    );
}