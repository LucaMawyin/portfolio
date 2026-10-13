import { getActiveSessions, requireSession } from "@/lib/auth";
import { getUserById } from "@/lib/user";
import SettingsClient from "./SettingsClient";
import { getContent } from "@/lib/getContent";
import { getProjects } from "@/lib/getProjects";

export default async function DashboardPage() {
    const session = await requireSession();

    const [user, content, sessions, projects] = await Promise.all([
        getUserById(session.user_id),
        getContent(),
        getActiveSessions(),
        getProjects(session),
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
            />
        );
    }

    return <p>User not found</p>
}