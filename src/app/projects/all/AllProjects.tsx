"use client";

import Button from "@/components/Button";
import DeleteButton from "@/components/DeleteButton";
import FadeInOnView from "@/components/FadeInOnView";
import { useNotifications } from "@/components/NotificationProvider";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AllProjects(props: {
    projects: Project[];
    isLoggedIn: boolean;
}) {

    const router = useRouter();
    const { notify } = useNotifications();

    // Fetching projects on load
    const [projects, setProjects] = useState<Project[]>(
        props.projects.filter((project) => project.deleted === 0)
    );

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    }, []);

    const getDelay = (i: number) => {
        if (typeof window === "undefined") return 0;

        const columns =
            window.innerWidth >= 1280 ? 3 :
            window.innerWidth >= 1024 ? 2 :
            1;

        return (i % columns) * 150;
    };

    return (
        <div className="w-full mt-[10vh]">
            <h1 className="text-center pb-4 px-8">
                All Projects
            </h1>

            <div className="
                grid
                grid-cols-1
                lg:grid-cols-2
                xl:grid-cols-3
                auto-rows-fr
                items-stretch
                px-[5%]
                pb-4
                gap-16
            ">
                {props.projects.map((project, i) => (
                    
                    <FadeInOnView
                        key={project.id}
                        className="
                            flex 
                            flex-col
                            gap-8
                            w-full 
                            h-full 
                            justify-center
                        "
                        style={{
                            "--delay": `${getDelay(i)}ms`,
                        } as React.CSSProperties}
                    >
                        <ProjectCard
                            project={project}
                            isLoggedIn={props.isLoggedIn}
                            position="start"
                            holdProgress={0}
                        />

                        {/* Delete button if logged in */}
                        {props.isLoggedIn && (
                            <div className="w-full flex justify-between">
                                <Button
                                    text="Edit"
                                    className="h-fit w-1/4!"
                                    y={2}
                                    x={0}
                                    onClick={() => {router.push(`/add-project/edit?id=${project.id}`)}}
                                />
                                <DeleteButton
                                    text="Project"
                                    className="h-fit w-1/4!"
                                    y={2}
                                    x={0}
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
                                        
                                        setProjects((prev) =>
                                            prev.filter((p) => p.id !== project.id)
                                        );
                                        
                                        notify("Project deleted successfully", "success");
                                    }}
                                />                        
                            </div>
                        )}
                    </FadeInOnView>              
                    


                ))}
            </div>
        </div>
    );
}