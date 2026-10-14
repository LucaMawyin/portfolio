import { notFound } from "next/navigation";
import { validateSession } from "@/lib/auth";
import HomeClient from "../HomeClient";
import { getProjects, getTech } from "@/lib/getProjects";
import { getContent } from "@/lib/getContent";
import { getExperience } from "@/lib/getExperience";
import { pages } from "@/lib/info";
import { timed } from "@/lib/timed";

export default async function Home({
    params,
}: {
    params: Promise<{ slug: string[] }>;
}) {
    const start = performance.now();

    const { slug } = await params;

    const path = `/${slug.join("/")}`;

    const validPage = pages.some((page) => {
        if (page.href === "/") {
            // Home and home sections
            return path === "/" || path === `/${page.section}`;
        }

        return page.href === path;
    });

    if (!validPage) {
        notFound();
    }


    try {
        const session = await timed(
            "validateSession",
            () => validateSession()
        );

        const [projects, tech, content, experience] = await Promise.all([
            timed("getProjects", () => getProjects(session)),
            timed("getTech", () => getTech()),
            timed("getContent", () => getContent()),
            timed("getExperience", () => getExperience()),
        ]);

        return (
            <HomeClient
                isLoggedIn={!!session}
                projects={projects}
                tech={tech}
                content={content}
                experience={experience}
            />
        );
    } finally {
        console.log(
            `[TIMING] Slug total: ${(performance.now() - start).toFixed(2)}ms`
        );
    }
}