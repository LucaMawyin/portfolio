"use client";

import { useEffect, useRef, useState } from "react";
import { Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";
import Button from "./Button";
import { useRouter } from "next/navigation";
import DeleteButton from "./DeleteButton";
import FadeInOnView from "./FadeInOnView";
import { useNotifications } from "./NotificationProvider";
import Link from "next/link";
import { createPortal } from "react-dom";
import EditButton from "./EditButton";
import AddButton from "./AddButton";

export default function Projects(props: {
    isLoggedIn: boolean;
    projects: Project[];
}) {
    const router = useRouter();
    const { notify } = useNotifications();

    // Fetching projects on load
    const [projects, setProjects] = useState<Project[]>(
        props.projects.filter((project) => project.deleted === 0)
    );

    const featuredPool = projects;

    const [featuredStart, setFeaturedStart] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    const maxFeaturedStart = Math.max(
        featuredPool.length - 3,
        0
    );

    const featuredProjects = featuredPool.slice(
        featuredStart,
        featuredStart + 3
    );

    const startX = useRef<number | null>(null);
    const [timerDeadline, setTimerDeadline] = useState(
        Date.now() + 10000
    );
    const [isInteracting, setIsInteracting] = useState(false);

    const pausedTimeRemaining = useRef<number | null>(null);

    const [hoveredProject, setHoveredProject] =
        useState<Project | null>(null);

    const closeTimeout =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const [holdProgress, setHoldProgress] = useState(0);
    const [holdingProjectId, setHoldingProjectId] =
        useState<number | null>(null);

    const holdAnimation = useRef<number | null>(null);
    const holdStartTime = useRef<number | null>(null);
    const holdingProject = useRef<Project | null>(null);

    const HOLD_DURATION = 1500;

    const cancelModalClose = () => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
    };

    const closeModal = () => {
        cancelModalClose();

        closeTimeout.current = setTimeout(() => {
            setHoveredProject(null);
            setIsInteracting(false);
        }, 100);
    };

    const cancelHold = () => {
        if (holdAnimation.current !== null) {
            cancelAnimationFrame(holdAnimation.current);
            holdAnimation.current = null;
        }

        holdStartTime.current = null;
        holdingProject.current = null;

        setHoldProgress(0);
        setHoldingProjectId(null);
        setIsInteracting(false);
    };

    const startHold = (project: Project) => {
        if (project.id === undefined || hoveredProject) return;

        cancelHold();

        holdingProject.current = project;
        holdStartTime.current = performance.now();

        setHoldingProjectId(project.id);
        setHoldProgress(0);
        setIsInteracting(true);

        const update = (now: number) => {
            if (
                holdStartTime.current === null ||
                holdingProject.current !== project
            ) {
                return;
            }

            const elapsed =
                now - holdStartTime.current;

            const progress = Math.min(
                elapsed / HOLD_DURATION,
                1
            );

            setHoldProgress(progress);

            if (progress >= 1) {
                holdAnimation.current = null;
                holdStartTime.current = null;
                holdingProject.current = null;

                setHoldProgress(0);
                setHoldingProjectId(null);
                setIsInteracting(false);

                setHoveredProject(project);

                return;
            }

            holdAnimation.current =
                requestAnimationFrame(update);
        };

        holdAnimation.current =
            requestAnimationFrame(update);
    };

    const goPrev = () => {
        if (featuredPool.length <= 1) return;

        setFeaturedStart((prev) => {
            if (isMobile) {
                return prev <= 0
                    ? featuredPool.length - 1
                    : prev - 1;
            }

            return prev <= 0
                ? maxFeaturedStart
                : prev - 1;
        });

        setTimerDeadline(Date.now() + 10000);
    };

    const goNext = () => {
        if (featuredPool.length <= 1) return;

        setFeaturedStart((prev) => {
            if (isMobile) {
                return prev >= featuredPool.length - 1
                    ? 0
                    : prev + 1;
            }

            return prev >= maxFeaturedStart
                ? 0
                : prev + 1;
        });

        setTimerDeadline(Date.now() + 10000);
    };

    const advanceIfExpired = () => {
        if (Date.now() >= timerDeadline) {
            goNext();
        }
    };

    const onTouchStart = (
        e: React.TouchEvent,
        project: Project
    ) => {
        startX.current = e.touches[0].clientX;
        setIsInteracting(true);

        startHold(project);
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        cancelHold();

        const touchStartX = startX.current;
        startX.current = null;

        if (touchStartX === null) {
            setIsInteracting(false);
            advanceIfExpired();
            return;
        }

        const endX = e.changedTouches[0].clientX;
        const diff = touchStartX - endX;
        const threshold = 50;

        if (diff > threshold) {
            goNext();
        } else if (diff < -threshold) {
            goPrev();
        } else {
            advanceIfExpired();
        }

        setIsInteracting(false);
    };

    useEffect(() => {
        if (
            isMobile
                ? featuredPool.length <= 1
                : featuredPool.length <= 3
        ) {
            return;
        }

        // Pause the timer while the modal is open
        if (hoveredProject) {
            if (pausedTimeRemaining.current === null) {
                pausedTimeRemaining.current = Math.max(
                    timerDeadline - Date.now(),
                    0
                );
            }

            return;
        }

        // Resume the timer when the modal closes
        if (pausedTimeRemaining.current !== null) {
            const remaining =
                pausedTimeRemaining.current;

            pausedTimeRemaining.current = null;

            setTimerDeadline(
                Date.now() + remaining
            );

            return;
        }

        const remaining = Math.max(
            timerDeadline - Date.now(),
            0
        );

        const timeout = setTimeout(() => {
            if (!isInteracting && !hoveredProject) {
                goNext();
            }
        }, remaining);

        return () => clearTimeout(timeout);
    }, [
        timerDeadline,
        featuredPool.length,
        isInteracting,
        hoveredProject,
        isMobile,
    ]);

    useEffect(() => {
        if (!hoveredProject) return;

        const body = document.body;
        const scrollY = window.scrollY;

        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.overflow = "hidden";

        return () => {
            body.style.position = "";
            body.style.top = "";
            body.style.left = "";
            body.style.right = "";
            body.style.overflow = "";

            window.scrollTo({
                top: scrollY,
                left: 0,
                behavior: "instant",
            });
        };
    }, [hoveredProject]);

    const cancelHoldAndPauseCarousel = () => {
        cancelHold();
        setIsInteracting(true);
    };

    useEffect(() => {
        if (!isMobile && featuredStart > maxFeaturedStart) {
            setFeaturedStart(maxFeaturedStart);
        }
    }, [
        featuredStart,
        maxFeaturedStart,
        isMobile,
    ]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 1279px)");

        const update = () => {
            setIsMobile(mediaQuery.matches);
        };

        update();

        mediaQuery.addEventListener("change", update);

        return () => {
            mediaQuery.removeEventListener("change", update);
        };
    }, []);

    return (
        <>
            {/* FEATURED PROJECTS */}
            <FadeInOnView>
                <div
                    className="
                        flex
                        flex-col
                        sm:flex-wrap
                        sm:flex-row
                        px-[10%]
                        justify-center
                        sm:justify-between
                        items-center
                        gap-4
                        pb-4
                        sm:pb-0
                    "
                >
                    <h1
                        className="
                            flex-1
                            min-w-min
                            sm:text-start
                            text-center
                        "
                    >
                        Featured Projects
                    </h1>

                    <div
                        className="
                            flex
                            flex-row
                            gap-4
                            shrink-0
                        "
                    >
                        <button
                            type="button"
                            onClick={goPrev}
                            disabled={
                                isMobile
                                    ? featuredPool.length <= 1
                                    : featuredPool.length <= 3
                            }
                            className="
                                cursor-pointer
                                w-10 h-10 p-3
                                flex items-center justify-center
                                rounded-xl
                                transition-all
                                duration-(--transition-duration)
                                shadow-[0_4px_10px_rgba(0,0,0,0.08),0_-1px_3px_rgba(0,0,0,0.04)]
                                hover:shadow-[0_8px_20px_rgba(0,0,0,0.12),0_-2px_4px_rgba(0,0,0,0.05)]
                                hover:scale-(--link-scale)
                                pillow
                                squircle
                                disabled:opacity-30
                                disabled:pointer-events-none
                            "
                        >
                            <img
                                src="/arrow-left.svg"
                                alt="Previous projects"
                            />
                        </button>

                        <button
                            type="button"
                            onClick={goNext}
                            disabled={
                                featuredPool.length <= 3
                            }
                            className="
                                cursor-pointer
                                w-10 h-10 p-3
                                flex items-center justify-center
                                rounded-xl
                                transition-all
                                duration-(--transition-duration)
                                shadow-[0_4px_10px_rgba(0,0,0,0.08),0_-1px_3px_rgba(0,0,0,0.04)]
                                hover:shadow-[0_8px_20px_rgba(0,0,0,0.12),0_-2px_4px_rgba(0,0,0,0.05)]
                                hover:scale-(--link-scale)
                                pillow
                                squircle
                                disabled:opacity-30
                                disabled:pointer-events-none
                            "
                        >
                            <img
                                src="/arrow-right.svg"
                                alt="Next projects"
                            />
                        </button>
                    </div>
                </div>

                {/* Project position indicators */}
                {featuredPool.length > 0 && (
                    <div
                        className={`
                            flex
                            justify-center
                            mt-3
                            ${props.isLoggedIn ? "pb-6" : "pb-8"}
                        `}
                    >
                        <div
                            className="
                                relative
                                flex
                                items-center
                                gap-2
                            "
                        >
                            {/* Three-project slider */}
                            <div
                                className="
                                    hidden
                                    xl:block
                                    absolute
                                    top-1/2
                                    -translate-y-1/2
                                    h-5
                                    rounded-full
                                    bg-black/10
                                    transition-all
                                    duration-300
                                    pointer-events-none
                                "
                                style={{
                                    width: "48px",
                                    left: `${-4 + featuredStart * 16}px`,
                                }}
                            />

                            {featuredPool.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setFeaturedStart(
                                            isMobile
                                                ? i
                                                : Math.min(i, maxFeaturedStart)
                                        );

                                        setTimerDeadline(
                                            Date.now() + 10000
                                        );
                                    }}
                                    aria-label={`Show projects starting at position ${
                                        i + 1
                                    }`}
                                    className="
                                        relative
                                        z-10
                                        w-2
                                        h-2
                                        rounded-full
                                        cursor-pointer
                                        transition-transform
                                        duration-300
                                    "
                                >
                                    <span
                                        className={`
                                            block
                                            w-2
                                            h-2
                                            rounded-full
                                            transition-transform
                                            duration-300
                                            ${
                                                i === featuredStart
                                                    ? "scale-125 bg-current"
                                                    : "bg-black/25"
                                            }
                                        `}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Project button if logged in */}
                {props.isLoggedIn && (
                    <div
                        className="
                            flex
                            w-full
                            justify-center
                            pb-8
                        "
                    >
                        <AddButton
                            text="Add Project"
                            x={4}
                            y={2}
                            action={() =>
                            router.push(
                                "/add-project"
                            )}
                        />

                    </div>
                )}
            </FadeInOnView>

            {/* Project cards */}

            {/* MOBILE / SMALL SCREEN CAROUSEL */}

            <FadeInOnView className="relative w-full">
                <div 
                    className="
                        flex
                        xl:hidden
                        transition-transform
                        duration-700
                        ease-in-out
                    "
                    style={{
                        transform: `translateX(-${featuredStart * 100}%)`,
                    }}
                    onTouchStart={(e) => {
                        startX.current = e.touches[0].clientX;
                    }}
                    onTouchEnd={onTouchEnd}
                    onTouchCancel={() => {
                        cancelHold();
                        startX.current = null;
                        setIsInteracting(false);
                        advanceIfExpired();
                    }}
                >
                    {featuredPool.map((project) => (
                        <div
                            key={project.id}
                            className="
                                w-full 
                                shrink-0 
                                flex 
                                justify-center 
                                px-[5%]
                            "
                        >
                            <div
                                className="flex h-full"
                                onMouseEnter={() => {
                                    startHold(project);
                                    setIsInteracting(true);
                                }}
                                onMouseLeave={() => {
                                    cancelHold();
                                    setIsInteracting(false);
                                }}
                                onTouchStart={(e) =>
                                    onTouchStart(e, project)
                                }
                                onTouchCancel={() => {
                                    cancelHold();
                                    startX.current = null;
                                    setIsInteracting(false);
                                }}
                            >
                                <ProjectCard
                                    project={project}
                                    condenseTech={true}
                                    isLoggedIn={props.isLoggedIn}
                                    position="start"
                                    className="max-w-full"
                                    onHoldCancel={cancelHoldAndPauseCarousel}
                                    onButtonHoverStart={() => {
                                        setIsInteracting(true);
                                    }}
                                    onButtonHoverEnd={() => {
                                        setIsInteracting(false);
                                        setTimerDeadline(Date.now() + 10000);
                                    }}
                                    holdProgress={
                                        holdingProjectId === project.id
                                            ? holdProgress
                                            : 0
                                    }
                                    onEdit={() => {
                                        router.push(`add-project/edit?id=${project.id}`);
                                    }}
                                    onDelete={async () => {
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
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>       
    
            </FadeInOnView>

            {/* LARGE SCREEN 3-COLUMN GRID */}
            <div
                className="
                    hidden
                    xl:grid
                    grid-cols-3
                    auto-rows-fr
                    items-stretch
                    px-[5%]
                    gap-16
                "
                onTouchEnd={onTouchEnd}
                onTouchCancel={() => {
                    cancelHold();
                    startX.current = null;
                    setIsInteracting(false);
                    advanceIfExpired();
                }}
            >
                {featuredProjects.map(
                    (project, i) => (
                        <FadeInOnView
                            key={`${project.id}-${featuredStart}`}
                            className="
                                w-full
                                flex
                                flex-col
                                items-center
                                gap-8
                                justify-between
                                fade-right
                                sm:fade-up
                            "
                            delay={i * 150}
                        >
                            <div
                                className="
                                    relative
                                    flex
                                    flex-1
                                    z-10
                                "
                                onMouseEnter={() => {
                                    startHold(project);
                                    setIsInteracting(true);
                                }}
                                onMouseLeave={() => {
                                    cancelHold();
                                    setIsInteracting(false);
                                }}
                                onTouchStart={(e) =>
                                    onTouchStart(
                                        e,
                                        project
                                    )
                                }
                            >

                                <ProjectCard
                                    project={project}
                                    condenseTech={true}
                                    isLoggedIn={props.isLoggedIn}
                                    position="start"
                                    className="max-w-full"
                                    onHoldCancel={cancelHoldAndPauseCarousel}
                                    onButtonHoverStart={() => {
                                        setIsInteracting(true);
                                    }}
                                    onButtonHoverEnd={() => {
                                        setIsInteracting(false);
                                        setTimerDeadline(Date.now() + 10000);
                                    }}
                                    holdProgress={
                                        holdingProjectId === project.id
                                            ? holdProgress
                                            : 0
                                    }
                                    onEdit={() => {
                                        router.push(`add-project/edit?id=${project.id}`);
                                    }}
                                    onDelete={async () => {
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
                                    }}
                                />

                            </div>
                        </FadeInOnView>
                    )
                )}
            </div>
            
            <FadeInOnView className="fade-right">
                <Link
                    href="/projects/all"
                    className="
                        group
                        flex flex-col items-center
                        mt-[10%] sm:mt-[5%]
                        px-[5%]
                    "
                >
                    <h2
                        className="
                            relative
                            whitespace-nowrap
                            text-[clamp(2rem,5vw,3rem)]
                            font-bold
                            text-center
                            transition-transform
                            duration-300
                            group-hover:translate-x-2
                        "
                    >
                        View All Projects

                        <span
                            className="
                                inline-block
                                ml-3
                                transition-transform
                                duration-300
                                group-hover:translate-x-2
                            "
                        >
                            →
                        </span>

                        <span
                            className="
                                absolute
                                left-0
                                -bottom-1.5
                                h-1
                                w-0
                                bg-current
                                transition-all
                                duration-300
                                group-hover:w-full
                                group-active:w-1/2
                                group-active:left-1/4
                            "
                        />
                    </h2>

                    <span
                        className="
                            mt-8 sm:mt-12
                            h-px
                            w-24
                            bg-black/30
                            transition-all
                            duration-300
                            group-hover:w-40
                            group-hover:bg-black
                        "
                    />
                </Link>                
            </FadeInOnView>


            {hoveredProject &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="
                            fixed
                            inset-0
                            z-9999
                            overflow-y-auto
                            overscroll-contain
                            bg-black/50
                            backdrop-blur-[2px]
                            min-h-screen!
                        "
                        onClick={closeModal}
                    >
                        {/* Scrollable portal content */}
                        <div
                            className="
                                min-h-full
                                w-full
                                flex
                                items-center
                                justify-center
                                p-4
                            "
                            onClick={closeModal}
                        >
                            {/* Modal */}
                            <div
                                className="
                                    relative
                                    animate-modal-fade-up
                                "
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                {/* Close button + card */}
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        aria-label="Close project"
                                        className="
                                            absolute
                                            -top-2
                                            -right-2
                                            z-10
                                            w-10
                                            h-10
                                            flex
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-white
                                            text-black
                                            text-2xl
                                            leading-none
                                            shadow-[0_4px_15px_rgba(0,0,0,0.2)]
                                            cursor-pointer
                                            transition-transform
                                            duration-200
                                            hover:scale-110
                                            group-hover:-translate-y-1
                                            group-hover:translate-x-1
                                            hover:translate-y-0
                                            hover:translate-x-0
                                        "
                                    >
                                        &times;
                                    </button>


                                    <ProjectCard
                                        project={hoveredProject}
                                        isLoggedIn={props.isLoggedIn}
                                        childClassName="xl:flex-col! xl:max-w-lg!"
                                        position="start"
                                        holdProgress={0}
                                        onEdit={() => {
                                            router.push(`add-project/edit?id=${hoveredProject.id}`);
                                        }}
                                        onDelete={async () => {
                                            const res = await fetch("/api/projects", {
                                                method: "DELETE",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({ id: hoveredProject.id }),
                                            });

                                            if (res.status === 401) {
                                                router.push("/login");
                                                return;
                                            }
                                            
                                            setProjects((prev) =>
                                                prev.filter((p) => p.id !== hoveredProject.id)
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}