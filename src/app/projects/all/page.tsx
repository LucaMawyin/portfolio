import { getProjects, getTech } from "@/lib/getProjects";
import AllProjects from "./AllProjects";
import { validateSession } from "@/lib/auth";

export default async function Page() {
    const session = await validateSession();

    const projects = await getProjects(session);
    const tech = await getTech();

    return (
        <AllProjects
            tech={tech}
            projects={projects}
            isLoggedIn={!!session}
        />
    );
}