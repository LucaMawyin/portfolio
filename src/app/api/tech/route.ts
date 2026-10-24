import { validateSession } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { TechBody } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await validateSession();

    // Authenticate before proceeding
    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const db = await getDB();
    const body = await req.json() as TechBody;

    const parse = (str: string) =>
        str.split(",").map(s => s.trim()).filter(Boolean);

    const seen = new Set<string>();

    const deduplicate = (names: string[]) =>
        names.filter(name => {
            const key = name.split("&")[0].trim().toLowerCase();

            if (seen.has(key)) return false;

            seen.add(key);
            return true;
        });

    const languages = deduplicate(parse(body.languages));
    const tools = deduplicate(parse(body.tools));
    const libraries = deduplicate(parse(body.libraries));
    const skills = deduplicate(parse(body.skills));

    // Just wipe & rebuild db
    await db
        .prepare(`DELETE FROM tech`)
        .run();
    
    await db
        .prepare("DELETE FROM sqlite_sequence WHERE name = 'tech'")
        .run();

    await db.batch([
        ...languages.map(name => 
            db.prepare(`INSERT INTO tech (name, category) VALUES (?,?)`)
            .bind(name,"languages")
        ),
        ...tools.map(name => 
            db.prepare(`INSERT INTO tech (name, category) VALUES (?,?)`)
            .bind(name,"tools")
        ),
        ...libraries.map(name => 
            db.prepare(`INSERT INTO tech (name, category) VALUES (?,?)`)
            .bind(name,"libraries")
        ),
        ...skills.map(name => 
            db.prepare(`INSERT INTO tech (name, category) VALUES (?,?)`)
            .bind(name,"skills")
        ),
    ])

    return NextResponse.json({ success: true });
}