import { validateSession } from "@/lib/auth";
import HomeClient from "./HomeClient";
import { getProjects, getTech } from "@/lib/getProjects";
import { getContent } from "@/lib/getContent";
import { getExperience } from "@/lib/getExperience";
import { timed } from "@/lib/timed";
import { Tech } from "@/lib/types";

export default async function Home() {

    const session = await timed("validateSession", () => validateSession());

    const [projects, content, experience] = await Promise.all([
        timed("getProjects", () => getProjects(session)),
        timed("getContent", () => getContent()),
        timed("getExperience", () => getExperience()),
    ]);
    
    const tech : Tech[] = [];


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