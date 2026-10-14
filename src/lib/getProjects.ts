import { getDB } from "@/lib/db";
import { Project, Session, Tech } from "@/lib/types";
import { getTechIcon, parseTechName } from "./techIcons";

export async function getProjects(session: Session | null): Promise<Project[]> {
    const isLoggedIn = !!session;

    const db = await getDB();
    
    const { results } = await db
        .prepare(`
            SELECT 
                p.*, 
                project_tag.name AS tag, 
                project_tag.colour AS colour,
                status_tag.name AS status,
                status_tag.colour AS status_colour
            FROM projects p
            LEFT JOIN tags project_tag
                ON p.tag = project_tag.name 
                AND project_tag.category = 'project'
            LEFT JOIN tags status_tag
                ON p.status = status_tag.name
                AND status_tag.category = 'status'
            
            ${isLoggedIn ? "" : "WHERE deleted = FALSE AND p.hidden = FALSE"}
            ORDER BY 
                p.pinned DESC,
                CASE WHEN p.pinned = 1 THEN p.updated_at END ASC,
                CASE WHEN p.pinned = 0 THEN p.created_at END DESC
        `)
        .all() as { results: Project[] };

    return results.map((p) => ({
        ...p,
        image: `/images/projects/${p.id}?v=${p.updated_at}`,
    }));
}

export async function getProject(
    slug: string,
    session: Session | null
): Promise<Project | null> {
    const db = await getDB();

    const isLoggedIn = !!session;

    const project = await db
        .prepare(`
            SELECT 
                p.*, 
                project_tag.name AS tag, 
                project_tag.colour AS colour,
                status_tag.name AS status,
                status_tag.colour AS status_colour
            FROM projects p
            LEFT JOIN tags project_tag
                ON p.tag = project_tag.name 
                AND project_tag.category = 'project'
            LEFT JOIN tags status_tag
                ON p.status = status_tag.name
                AND status_tag.category = 'status'
            WHERE p.slug = ?
            ${isLoggedIn ? "" : "AND p.deleted = FALSE AND p.hidden = FALSE"}
        `)
        .bind(slug)
        .first() as Project | null;

    if (!project) {
        return null;
    }

    return {
        ...project,
        image: `/images/projects/${project.id}?v=${project.updated_at}`,
    };
}

export const getTech = async (): Promise<Tech[]> => {

    const start = performance.now();

    const db = await getDB();

    const [techRes, projectRes] = await Promise.all([
        db.prepare(`SELECT * FROM tech`).all() as Promise<{ results: Tech[] }>,
        db.prepare(`SELECT languages, tools, libraries FROM projects`).all() as Promise<{
            results: {
                languages: string | null;
                tools: string | null;
                libraries: string | null;
            }[];
        }>,
    ]);

    console.log(
        `[TIMING] getTech queries: ${(performance.now() - start).toFixed(1)}ms`
    );

    const processingStart = performance.now();


    const techMap = new Map<string, Tech>();
    let largestId = 0;

    const addTech = (name: string, category: Tech["category"]) => {
        const parsed = parseTechName(name);
        const normalizedName = parsed.name.toLowerCase();

        if (!normalizedName) return;

        const existing = techMap.get(normalizedName);

        if (!existing) {
            largestId++;

            techMap.set(normalizedName, {
                id: largestId,
                name,
                category,
            });
        } else if (
            !parseTechName(existing.name).iconOverride &&
            parsed.iconOverride
        ) {
            techMap.set(normalizedName, {
                id: existing.id,
                name,
                category,
            });
        }
    };

    for (const tech of techRes.results) {
        largestId = Math.max(largestId, tech.id);

        const parsed = parseTechName(tech.name);
        const key = parsed.name.toLowerCase();

        const existing = techMap.get(key);

        if (!existing) {
            techMap.set(key, tech);
        } else if (
            !parseTechName(existing.name).iconOverride &&
            parsed.iconOverride
        ) {
            techMap.set(key, tech);
        }
    }

    for (const project of projectRes.results) {
        const languages: string[] = JSON.parse(project.languages || "[]");
        const tools: string[] = JSON.parse(project.tools || "[]");
        const libraries: string[] = JSON.parse(project.libraries || "[]");

        for (const language of languages) addTech(language, "languages");
        for (const tool of tools) addTech(tool, "tools");
        for (const library of libraries) addTech(library, "libraries");
    }

    console.log(
        `[TIMING] getTech processing: ${(performance.now() - processingStart).toFixed(1)}ms`
    );

    return Array.from(techMap.values()).map((tech) => {
        const parsed = parseTechName(tech.name);

        const defaultIcon = getTechIcon(parsed.name);
        const overrideIcon = parsed.iconOverride
            ? getTechIcon(parsed.iconOverride)
            : undefined;

        return {
            ...tech,
            iconPath: overrideIcon?.path ?? defaultIcon?.path,
        };
    });
};