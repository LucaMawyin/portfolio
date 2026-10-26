import { BriefcaseBusiness, Circle, FileText, FolderGit2, GraduationCap, House, LogOut, Settings, UserRound, Wrench } from "lucide-react";

export function getPageIcon(title: string) {
    const name = title.toLowerCase();

    const Icon =
        name === "home" ? House :
        name.includes("experience") ? BriefcaseBusiness :
        name.includes("education") ? GraduationCap :
        name.includes("project") ? FolderGit2 :
        name.includes("about") ? UserRound :
        name.includes("settings") ? Settings :
        name.includes("tech") ? Wrench :
        name.includes("logout") || name.includes("log out") ? LogOut :
        name.includes("resume") ? FileText :
        Circle;

    return Icon;
}