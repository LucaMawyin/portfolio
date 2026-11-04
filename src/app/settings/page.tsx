import { getActiveSessions, requireSession } from "@/lib/auth";
import { getUserById } from "@/lib/user";
import SettingsClient from "./SettingsClient";
import { getContent } from "@/lib/getContent";
import { getProjects, getTech } from "@/lib/getProjects";
import { getLinks } from "@/lib/getLinks";
import { SocialLink, Tech } from "@/lib/types";

export default async function DashboardPage() {
    const session = await requireSession();

    const [user, content, sessions, projects, links, tech] = await Promise.all([
        getUserById(session.user_id),
        getContent(),
        getActiveSessions(),
        getProjects(session),
        getLinks(),
        getTech(),
    ]);
    
    const { currentSession, activeSessions } = sessions;
    
    if (user){
        return (
            <SettingsClient 
                user={user} 
                content={content} 
                activeSessions={activeSessions} 
                currentSession={currentSession}
                projects={projects}
                links={links as SocialLink[]}
                techEntries={tech as Tech[]}
            />
        );
    }

    return <p>User not found</p>
}