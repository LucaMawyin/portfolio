import { validateSession } from "@/lib/auth";
import HomeClient from "./HomeClient";
import { getProjects, getTech } from "@/lib/getProjects";
import { Session } from "@/lib/types";
import { getContent } from "@/lib/getContent";
import { getExperience } from "@/lib/getExperience";

export default async function Home() {

    const session = await validateSession() as Session;

    const [projects, tech, content, experience ] = await Promise.all([
        getProjects(session),
        getTech(),
        getContent(),
        getExperience(),
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
}