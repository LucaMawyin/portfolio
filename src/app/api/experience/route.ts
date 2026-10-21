import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { validateSession } from "@/lib/auth";
import { Experience } from "@/lib/types";
import { capitalizeNamesAndTitles } from "@/lib/capitalizeNamesAndTitles";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const id = formData.get("id")?.toString();
        const title = formData.get("title")?.toString();
        const company = formData.get("company")?.toString();
        const description = formData.get("description")?.toString();
        const tag = formData.get("tag")?.toString();
        const city = formData.get("city")?.toString() || null;
        const region = formData.get("region")?.toString() ||null;
        const start_date = formData.get("start_date")?.toString();
        const end_date = formData.get("end_date")?.toString() || null;
        const hidden = formData.get("hidden")?.toString() || null;
        const rawStatus = (formData.get("status") as string) || null;
        const status = rawStatus
            ? capitalizeNamesAndTitles(rawStatus.trim().toLowerCase())
            : null;
        const statusColour = formData.get("status_colour") as string | null;

        // Ensure link starts with https:// if provided
        const rawLink = (formData.get("link") as string) || null;
        const link =
        rawLink
            ? (rawLink.startsWith("https://")
            ? rawLink.trim()
            : `https://${rawLink.trim()}`)
            : null;

        // basic validation
        if (!title || !company || !description) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const db = await getDB();

        // Add tag to db if it doesnt exist
        if (tag) {
          await db
            .prepare(`
              INSERT OR IGNORE INTO tags (name,category)
              VALUES (?,?)
            `)
            .bind(tag,"experience")
            .run();
        }

        if (status) {
            await db
                .prepare(`
                    INSERT INTO tags (name,category,colour)
                    VALUES (?, ?, ?)
                    ON CONFLICT(name, category) DO UPDATE SET colour = EXCLUDED.colour
                `)
                .bind(status,"exp_status",statusColour)
                .run();
        }

        // UPDATE if id exists
        if (id) {
            await db
                .prepare(`
                    UPDATE experience
                    SET title = ?, company = ?, description = ?, tag = ?,
                        city = ?, region = ?, start_date = ?, end_date = ?,
                        hidden = ?, status = ?, link = ?
                    WHERE id = ?
                `)
                .bind(
                    title,
                    company,
                    description,
                    tag,
                    city,
                    region,
                    start_date,
                    end_date,
                    hidden,
                    status,
                    link,
                    id
                )
                .run();

            return NextResponse.json({ success: true, updated: true });
        }

        // INSERT new experience
        await db
            .prepare(`
                INSERT INTO experience (
                    title, company, description, tag, city, region,
                    start_date, end_date, hidden, status, link
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                title,
                company,
                description,
                tag,
                city,
                region,
                start_date,
                end_date,
                hidden,
                status,
                link
            )
            .run();

        return NextResponse.json({ success: true, created: true });
    } 
    
    catch (err: any) {
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}

// Delete project
export async function DELETE(req: NextRequest) {

    // Authenticate before proceeding
    const session = await validateSession();
    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {

        const db = await getDB();
        const { id } = await req.json() as Experience;

        // No project id provided
        if (!id) {
            return NextResponse.json(
                { error: "Missing experience id" },
                { status: 400 }
            );
        }

        await db
            .prepare("DELETE FROM experience WHERE id = ?")
            .bind(id)
            .run();

        return NextResponse.json({
            success: true,
        });

    } 
    
    // Delete failed
    catch (err) {
        return NextResponse.json(
            { error: "Failed to delete experience" },
            { status: 500 }
        );
    }
}