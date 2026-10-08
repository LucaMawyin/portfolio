"use client";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import DeleteButton from "@/components/DeleteButton";
import EditButton from "@/components/EditButton";
import { useNotifications } from "@/components/NotificationProvider";
import { getProject } from "@/lib/getProjects";
import { shadow } from "@/lib/tags";
import { Project } from "@/lib/types";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function ProjectPageClient({
    project,
    isLoggedIn,
}: {
    project: Project;
    isLoggedIn: boolean;
}) {

    const router = useRouter();
    const { notify } = useNotifications();

    const tools = (
    typeof project.tools === "string"
        ? JSON.parse(project.tools || "[]")
        : project.tools || []
    ) as string[];

    const languages = (
    typeof project.languages === "string"
        ? JSON.parse(project.languages || "[]")
        : project.languages || []
    ) as string[];

    const libraries = (
    typeof project.libraries === "string"
        ? JSON.parse(project.libraries || "[]")
        : project.libraries || []
    ) as string[];

    const { 
        glowColour, 
        glowRGB, 
        borderColour 
    } = shadow(project.colour);

    const { 
        glowColour: statusGlowColour, 
        glowRGB: statusGlowRGB, 
        borderColour: statusBorderColour
    } = shadow(project.status_colour);

    return (
        <div className="
            mt-[10vh]
            flex
            flex-1
            justify-center
        ">
            <div className="
                flex
                flex-col
                flex-1
                max-w-2xl
                p-4
                gap-4
            ">
                {/* RETURN */}
                <Link 
                    href="/projects" 
                    className="
                        w-fit 
                        transition-all
                        duration-(--transition-duration)
                        hover:scale-(--subtle-scale)
                        hover:font-semibold
                    "
                >
                    &lt; Return to Projects
                </Link>

                {/* PROJECT */}
                {project.image && (
                    <div className="relative">
                        {project.status && (
                            <Badge
                                text={project.status}
                                style={{
                                    "--glow" : statusGlowRGB,
                                    backgroundColor: project.status_colour,
                                    borderColor: statusBorderColour,
                                    color: statusGlowColour,
                                } as React.CSSProperties}
                                className="
                                    absolute
                                    right-0
                                    top-0
                                    m-2
                                    border
                                    animate-tag-pulse
                                "
                            />                            
                        )}

                        {project.tag && (
                            <Badge
                                text={project.tag}
                                style={{
                                    "--glow" : glowRGB,
                                    backgroundColor: project.colour,
                                    borderColor: borderColour,
                                    color: glowColour,
                                } as React.CSSProperties}
                                textSize="xl"
                                px={3}
                                py={0}
                                className="
                                    absolute
                                    left-0
                                    top-0
                                    m-2
                                    border
                                    animate-tag-pulse
                                "
                            />                            
                        )}

                        <img
                            src={project.image}
                            alt={project.name}
                            className="w-full rounded-2xl"
                        />                        
                    </div>

                )}
                
                <div>
                    <a
                        href={project.link}
                        target="_blank"
                        className="
                            group
                            flex
                            flex-wrap
                            w-full
                            justify-between
                            mb-4
                            gap-4
                            transition-colors
                            duration-200
                            hover:text-blue-800
                        "
                    >
                        <h2 className="m-0 text-6xl leading-none">
                            {project.name}
                        </h2>

                        {project.link && (() => {
                            let isGithub = false;

                            try {
                                const hostname = new URL(project.link).hostname;
                                isGithub = hostname === "github.com" || hostname.endsWith(".github.com");
                            } catch {

                            }

                            return (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        window.open(
                                            project.link,
                                            "_blank",
                                            "noopener,noreferrer"
                                        );
                                    }}
                                    aria-label={
                                        isGithub
                                            ? `View ${project.name} source code`
                                            : `Visit ${project.name} website`
                                    }
                                    style={{
                                        "--glow": glowRGB,
                                        "--project-colour": project.colour,
                                        color: glowColour,
                                        borderColor: borderColour,
                                    } as React.CSSProperties}                  
                                    className="
                                        group
                                        self-center
                                        h-fit
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        rounded-full
                                        border-2
                                        bg-[color-mix(in_srgb,var(--project-colour)_25%,transparent)]
                                        text-sm
                                        font-semibold
                                        shadow-[0_2px_8px_rgba(0,0,0,0.12)]
                                        cursor-pointer
                                        transition-all
                                        duration-200
                                        group-hover:scale-105
                                        group-hover:border-gray-500
                                        group-hover:bg-(--project-colour)
                                        group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.18)]
                                        group-active:scale-95
                                        animate-tag-pulse
                                    "
                                >
                                    <span>{isGithub ? "View Code" : "Visit Website"}</span>
                                    <span className="
                                        animate-[arrow-idle_1.2s_ease-in-out_infinite]
                                        transition-transform
                                        duration-200
                                    ">
                                        ↗
                                    </span>
                                </button>
                            );
                        })()}
                    </a>

                    <div className="
                        text-gray-400 
                        text-sm
                        flex
                        flex-col
                        gap-2
                    ">
                        <p>
                            Created{" "}
                            {new Date(project.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}                    
                        </p>

                        <p>
                            Updated{" "}
                            {new Date(project.updated_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}                    
                        </p>                    
                    </div>                    
                </div>


                

                {project.subtitle && (
                    <h2 className="
                        min-w-full
                        prose
                        prose-sm
                        prose-a:text-blue-400
                        prose-a:transition-colors
                        prose-a:duration-100
                        prose-a:no-underline
                        prose-a:hover:text-blue-800
                        prose-h1:mb-0
                        prose-h1:text-6xl!
                        prose-h2:mt-0
                        prose-h2:mb-4
                        prose-h2:text-4xl!
                        prose-h3:mt-0
                        prose-h3:text-2xl!
                    ">
                        <ReactMarkdown>
                            {project.subtitle}
                        </ReactMarkdown>
                    </h2>  
                )}
                
                <div className="
                    min-w-full
                    prose
                    prose-sm
                    prose-a:text-blue-400
                    prose-a:transition-colors
                    prose-a:duration-100
                    prose-a:no-underline
                    prose-a:hover:text-blue-800
                    prose-h1:mb-0
                    prose-h1:text-6xl!
                    prose-h2:mt-0
                    prose-h2:mb-4
                    prose-h2:text-4xl!
                    prose-h3:mt-0
                    prose-h3:text-2xl!
                ">
                    <ReactMarkdown>
                        {project.content}
                    </ReactMarkdown>
                </div>  


                {/* TECHNOLOGIES */}
                <div className="
                    pt-4
                    border-t
                    border-gray-200
                ">
                    <h2 className="text-2xl font-bold">
                        Technologies
                    </h2>

                    {/* LANGUAGES */}
                    {languages.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <b>Languages:</b>

                            {languages.map((lang, i) => (
                                <Badge
                                    key={i}
                                    fontWeight="normal"
                                    borderRadius="lg"
                                    textSize="xs"
                                    shadow="sm"
                                    px={2}
                                    py={1}
                                    className="bg-gray-200 border border-gray-300"
                                    text={lang}
                                />
                            ))}
                        </div>
                    )}

                    {/* LIBRARIES */}
                    {libraries.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <b>Libraries:</b>

                            {libraries.map((library, i) => (
                                <Badge
                                    key={i}
                                    fontWeight="normal"
                                    borderRadius="lg"
                                    textSize="xs"
                                    shadow="sm"
                                    px={2}
                                    py={1}
                                    className="bg-gray-100 border border-gray-300"
                                    text={library}
                                />
                            ))}
                        </div>
                    )}

                    {/* TOOLS */}
                    {tools.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <b>Tools:</b>

                            {tools.map((tool, i) => (
                                <Badge
                                    key={i}
                                    fontWeight="normal"
                                    borderRadius="lg"
                                    textSize="xs"
                                    shadow="sm"
                                    px={2}
                                    py={1}
                                    className="bg-gray-300 border border-gray-400"
                                    text={tool}
                                />
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Delete button if logged in */}
                {isLoggedIn && (
                    <div className="w-full flex flex-wrap justify-between mt-8 gap-6">
                        <EditButton
                            action={() => {router.push(`/add-project/edit?id=${project.id}`)}}
                        />

                        <DeleteButton
                            itemName={project.name}
                            action={async () => {
                                const res = await fetch("/api/projects", {
                                    method: "DELETE",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ id: project.id }),
                                });

                                if (res.status === 401) {
                                    router.push("/login");
                                    return;
                                }
                                
                                router.push("/projects");
                                
                                notify("Project deleted successfully", "success");
                            }}
                        />                        
                    </div>
                )}
            </div>
        </div>
    );
}