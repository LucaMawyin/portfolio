import { validateSession } from "@/lib/auth";
import HomeClient from "./HomeClient";
import { getProjects, getTech } from "@/lib/getProjects";
import { Session, SocialLink } from "@/lib/types";
import { getContent } from "@/lib/getContent";
import { getExperience } from "@/lib/getExperience";
import { getLinks } from "@/lib/getLinks";

export default async function Home() {

    const session = await validateSession() as Session;

    const [projects, tech, content, experience, links ] = await Promise.all([
        getProjects(session),
        getTech(),
        getContent(),
        getExperience(session),
        getLinks(),
    ]);


    return (
        <HomeClient 
            links={links as SocialLink[]}
            isLoggedIn={!!session} 
            projects={projects}
            tech={tech}
            content={content}
            experience={experience}
        />
    );
}