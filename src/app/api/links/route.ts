
import { validateSession } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await validateSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json() as any;
        const title =
            typeof body.title === "string" ? body.title.trim() : "";
        const rawUrl =
            typeof body.url === "string" ? body.url.trim() : "";

        if (!title || !rawUrl) {
            return NextResponse.json(
                { error: "Title and URL are required" },
                { status: 400 }
            );
        }

        if (title.length > 100 || rawUrl.length > 2048) {
            return NextResponse.json(
                { error: "Title or URL is too long" },
                { status: 400 }
            );
        }

        const url = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawUrl)
            ? `mailto:${rawUrl}`
            : rawUrl;

        let parsedUrl: URL;

        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: "Invalid URL or email address" },
                { status: 400 }
            );
        }

        if (!["http:", "https:", "mailto:"].includes(parsedUrl.protocol)) {
            return NextResponse.json(
                { error: "Only HTTP, HTTPS, and email links are allowed" },
                { status: 400 }
            );
        }

        const db = await getDB();

        const result = await db
            .prepare(
                "INSERT INTO links (title, url) VALUES (?, ?) RETURNING id, title, url"
            )
            .bind(title, url)
            .first();

        if (!result) {
            return NextResponse.json(
                { error: "Failed to create link" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { link: result },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { error: "Failed to add link" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    const session = await validateSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json() as any;

        const id = body.id;
        const title =
            typeof body.title === "string" ? body.title.trim() : "";
        const rawUrl =
            typeof body.url === "string" ? body.url.trim() : "";

        if (!Number.isSafeInteger(id) || id <= 0) {
            return NextResponse.json(
                { error: "Invalid link ID" },
                { status: 400 }
            );
        }

        if (!title || !rawUrl) {
            return NextResponse.json(
                { error: "Title and URL are required" },
                { status: 400 }
            );
        }

        if (title.length > 100 || rawUrl.length > 2048) {
            return NextResponse.json(
                { error: "Title or URL is too long" },
                { status: 400 }
            );
        }

        const url = rawUrl;

        let parsedUrl: URL;

        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: "Invalid URL or email address" },
                { status: 400 }
            );
        }

        if (!["http:", "https:", "mailto:"].includes(parsedUrl.protocol)) {
            return NextResponse.json(
                { error: "Only HTTP, HTTPS, and email links are allowed" },
                { status: 400 }
            );
        }

        const db = await getDB();

        const link = await db
            .prepare(`
                UPDATE links
                SET title = ?, url = ?
                WHERE id = ?
                RETURNING id, title, url
            `)
            .bind(title, url, id)
            .first();

        if (!link) {
            return NextResponse.json(
                { error: "Link not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ link });
    } catch (error) {
        const message = error instanceof Error ? error.message : "";

        if (message.includes("UNIQUE constraint failed")) {
            return NextResponse.json(
                { error: "A link with that title or URL already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update link" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const session = await validateSession();

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json() as any;
        const id = body.id;

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { error: "Invalid link ID" },
                { status: 400 }
            );
        }

        const db = await getDB();

        const result = await db
            .prepare("DELETE FROM links WHERE id = ? RETURNING id")
            .bind(id)
            .first();

        if (!result) {
            return NextResponse.json(
                { error: "Link not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: "Failed to delete link" },
            { status: 500 }
        );
    }
}