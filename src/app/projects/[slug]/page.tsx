import { getProject, getTech } from "@/lib/getProjects";
import { validateSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProjectPageClient from "./ProjectPageClient";

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const session = await validateSession();

    const project = await getProject(slug, session);
    const tech = await getTech();

    if (!project) {
        notFound();
    }

    return (
        <ProjectPageClient
            project={project}
            isLoggedIn={!!session}
            tech={tech}
        />
    );
}