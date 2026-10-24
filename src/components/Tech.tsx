"use client";

import { Project, Tech } from "@/lib/types";
import FadeInOnView from "./FadeInOnView";
import { useRouter } from "next/navigation";
import Badge from "./Badge";
import { useEffect, useRef, useState } from "react";
import { getInitials } from "@/lib/getInitials";
import EditButton from "./EditButton";
import { parseTechName } from "@/lib/techIcons";
import { createPortal } from "react-dom";

type PopupPlacement = "top" | "bottom" | "left" | "right";

export default function TechStack(props: {
    isLoggedIn: boolean;
    tech: Tech[];
    projects: Project[];
}) {
    const [highlighted, setHighlighted] = useState<Record<string, string>>({});
    const [activeTech, setActiveTech] = useState<number | null>(null);
    const [popupPosition, setPopupPosition] = useState({
        top: 0,
        left: 0,
    });

    const [popupPlacement, setPopupPlacement] =
        useState<PopupPlacement>("right");

    const badgeRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const popupRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [pointerOffset, setPointerOffset] = useState(24);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getProjectsForTech = (techName: string) => {

        const parseTechArray = (value: string[] | string | null | undefined): string[] => {
            if (!value) return [];

            if (Array.isArray(value)) return value;

            try {
                const parsed: unknown = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        };

        const name = parseTechName(techName).name.toLowerCase();

        return props.projects.filter((project: Project) => {
            const projectTech = [
                ...parseTechArray(project.languages),
                ...parseTechArray(project.libraries),
                ...parseTechArray(project.tools),
                ...parseTechArray(project.skills),
            ];

            return projectTech.some((item) => {
                const cleanName = item.split("&icon=")[0];

                return (
                    parseTechName(cleanName).name.toLowerCase() === name
                );
            });
        });
    };

    const positionPopup = (techId: number) => {
        const badge = badgeRefs.current[techId];
        if (!badge) return;

        const rect = badge.getBoundingClientRect();
        const gap = 12;
        const margin = 16;
        const popupWidth = Math.min(288, window.innerWidth - margin * 2);
        const popupHeight = popupRef.current?.offsetHeight ?? 200;

        const spaceRight = window.innerWidth - rect.right - margin;
        const spaceLeft = rect.left - margin;
        const spaceBelow = window.innerHeight - rect.bottom - margin;

        let placement: PopupPlacement;

        if (spaceRight >= popupWidth + gap) {
            placement = "right";
        } else if (spaceLeft >= popupWidth + gap) {
            placement = "left";
        } else if (spaceBelow >= Math.min(popupHeight, 240) + gap) {
            placement = "bottom";
        } else {
            placement = "top";
        }

        setPopupPlacement(placement);

        let top = rect.top + rect.height / 2;
        let left = rect.right + gap;

        if (placement === "left") {
            left = rect.left - popupWidth - gap;
        } else if (placement === "top" || placement === "bottom") {
            left = rect.left + rect.width / 2 - popupWidth / 2;
            top =
                placement === "bottom"
                    ? rect.bottom + gap
                    : rect.top - gap - popupHeight;
        }

        if (placement === "left" || placement === "right") {
            top = Math.max(
                margin + popupHeight / 2,
                Math.min(window.innerHeight - margin - popupHeight / 2, top)
            );
        } else {
            left = Math.max(
                margin,
                Math.min(window.innerWidth - popupWidth - margin, left)
            );
        }

        const badgeCenterX = rect.left + rect.width / 2;
        const badgeCenterY = rect.top + rect.height / 2;

        if (placement === "top" || placement === "bottom") {
            setPointerOffset(
                Math.max(16, Math.min(popupWidth - 16, badgeCenterX - left))
            );
        } else {
            setPointerOffset(
                Math.max(16, Math.min(popupHeight - 16, badgeCenterY - top + popupHeight / 2))
            );
        }

        setPopupPosition({ top, left });
    };

    const openTechPopup = (techId: number) => {
        setActiveTech(techId);
    };

    useEffect(() => {
        if (activeTech === null) return;

        const updatePosition = () => positionPopup(activeTech);

        // Reposition after the popup has rendered and its size is measurable.
        const frame = requestAnimationFrame(updatePosition);

        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [activeTech, props.projects]);

    useEffect(() => {
        if (activeTech === null) return;

        const handleOutsideInteraction = (event: Event) => {
            const target = event.target;

            if (!(target instanceof Node)) return;

            const clickedBadge = Object.values(badgeRefs.current).some(
                (badge) => badge?.contains(target)
            );

            const clickedPopup = popupRef.current?.contains(target);

            if (!clickedBadge && !clickedPopup) {
                setActiveTech(null);
            }
        };

        const handleScroll = () => {
            setActiveTech(null);
        };

        document.addEventListener("pointerdown", handleOutsideInteraction);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideInteraction);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [activeTech]);

    useEffect(() => {
        const grouped = props.tech.reduce(
            (acc: Record<string, string[]>, item) => {
                acc[item.category] ??= [];
                acc[item.category].push(item.name);
                return acc;
            },
            {}
        );

        const categories = [
            "languages",
            "libraries",
            "tools",
            "skills",
        ].filter((category) => grouped[category]?.length);

        const updateHighlight = () => {
            if (!categories.length) return;

            const category =
                categories[Math.floor(Math.random() * categories.length)];

            const items = grouped[category];

            const item =
                items[Math.floor(Math.random() * items.length)];

            setHighlighted((current) => ({
                ...current,
                [category]: item,
            }));
        };

        setHighlighted(() => {
            const initial: Record<string, string> = {};

            categories.forEach((category) => {
                const items = grouped[category];

                initial[category] =
                    items[Math.floor(Math.random() * items.length)];
            });

            return initial;
        });

        const interval = setInterval(updateHighlight, 2000);

        return () => clearInterval(interval);
    }, [props.tech]);

    // Keep the full Tech objects here so we have access to iconPath.
    const grouped = props.tech.reduce(
        (acc: Record<string, Tech[]>, item) => {
            acc[item.category] ??= [];
            acc[item.category].push(item);
            return acc;
        },
        {}
    );

    const sections = [
        {
            key: "languages",
            title: "Languages",
            accent: {
                bg: "bg-blue-50",
                border: "border-blue-200",
                text: "text-blue-600",
                icon: "bg-blue-100",
            },
        },
        {
            key: "libraries",
            title: "Libraries & Frameworks",
            accent: {
                bg: "bg-purple-50",
                border: "border-purple-200",
                text: "text-purple-600",
                icon: "bg-purple-100",
            },
        },
        {
            key: "tools",
            title: "Tools",
            accent: {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                text: "text-emerald-600",
                icon: "bg-emerald-100",
            },
        },
        {
            key: "skills",
            title: "Skills",
            accent: {
                bg: "bg-amber-50",
                border: "border-amber-200",
                text: "text-amber-600",
                icon: "bg-amber-100",
            },
        },
    ];

    const router = useRouter();

    return (
        <div
            id="tech"
            className="
                w-full
                flex flex-col
                items-center
                text-center
            "
        >
            <FadeInOnView className="flex flex-wrap w-full items-center justify-center gap-x-8 gap-y-2 px-4">
                <h1>
                    Tech I Use
                </h1>

                {props.isLoggedIn && (
                    <EditButton
                        action={() => router.push("/edit-tech")}
                    />
                )}
            </FadeInOnView>

            <div
                className="
                    w-full
                    max-w-7xl
                    px-[5%]
                    flex flex-col
                "
            >
                {sections.map((section, index) => {
                    const items = [...(grouped[section.key] ?? [])].sort(
                        (a, b) => a.name.localeCompare(b.name)
                    );

                    return (
                        <FadeInOnView
                            key={section.key}
                            className={`fade-left ${
                                activeTech !== null ? "z-50" : "z-0"
                            }`}
                        >
                            <div
                                className={`
                                    py-8
                                    ${
                                        index !== 0
                                            ? "border-t border-gray-200"
                                            : ""
                                    }
                                `}
                            >
                                <div
                                    className="
                                        flex
                                        flex-col
                                        md:flex-row
                                        md:items-start
                                        gap-5
                                    "
                                >
                                    {/* TITLE */}
                                    <div
                                        className="
                                            md:w-56
                                            shrink-0
                                            text-left
                                        "
                                    >
                                        <h2
                                            className="
                                                text-2xl
                                                font-semibold
                                            "
                                        >
                                            {section.title}
                                        </h2>

                                        <span
                                            className="
                                                text-sm
                                                text-gray-400
                                            "
                                        >
                                            {items.length} technologies
                                        </span>
                                    </div>

                                    {/* BADGES */}
                                    <div
                                        className="
                                            flex-1
                                            flex
                                            flex-wrap
                                            gap-2
                                            justify-start
                                        "
                                    >
                                        {items.map((item) => {
                                            const parsed = parseTechName(item.name);

                                            const isHighlighted =
                                                highlighted[section.key] === parsed.name;

                                            const initials = getInitials(parsed.name);

                                            return (
                                                <div
                                                    key={item.id}
                                                    ref={(element) => {
                                                        badgeRefs.current[item.id] = element;
                                                    }}
                                                    className="relative inline-flex"
                                                >
                                                    <Badge
                                                        key={item.id}
                                                        onClick={() => {
                                                            if (activeTech === item.id) {
                                                                setActiveTech(null);
                                                            } else {
                                                                openTechPopup(item.id);
                                                            }
                                                        }}
                                                        textSize="sm"
                                                        borderRadius="xl"
                                                        shadow={
                                                            isHighlighted
                                                                ? "md"
                                                                : "none"
                                                        }
                                                        fontWeight={
                                                            isHighlighted
                                                                ? "semibold"
                                                                : "normal"
                                                        }
                                                        px={2}
                                                        className={`
                                                            transition-all duration-300
                                                            border
                                                            cursor-pointer
                                                            hover:-translate-y-1
                                                            hover:shadow-md
                                                            ${
                                                                isHighlighted
                                                                    ? `
                                                                        ${section.accent.bg}
                                                                        ${section.accent.border}
                                                                        ${section.accent.text}
                                                                        -translate-y-1
                                                                        shadow-md
                                                                    `
                                                                    : `
                                                                        bg-white
                                                                        border-gray-300
                                                                        hover:${section.accent.bg}
                                                                        hover:${section.accent.border}
                                                                    `
                                                            }
                                                        `}
                                                        text={parsed.name}
                                                    >
                                                        <div
                                                            className={`
                                                                flex
                                                                items-center
                                                                justify-center
                                                                w-6
                                                                h-6
                                                                rounded-md
                                                                text-[10px]
                                                                font-semibold
                                                                ${
                                                                    isHighlighted
                                                                        ? `${section.accent.icon} ${section.accent.text}`
                                                                        : "bg-gray-100 text-gray-500"
                                                                }
                                                            `}
                                                        >
                                                            {item.iconPath ? (
                                                                <svg
                                                                    viewBox="0 0 24 24"
                                                                    className="w-4 h-4 fill-current"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        d={
                                                                            item.iconPath
                                                                        }
                                                                    />
                                                                </svg>
                                                            ) : (
                                                                initials
                                                            )}
                                                        </div>
                                                    </Badge>  

                                                    {mounted &&
                                                        activeTech !== null &&
                                                        createPortal(
                                                            (() => {
                                                                const activeItem = props.tech.find(
                                                                    (tech) => tech.id === activeTech
                                                                );

                                                                if (!activeItem) return null;

                                                                const parsed = parseTechName(activeItem.name);
                                                                const matchingProjects = getProjectsForTech(activeItem.name);

                                                                return (
                                                                    <div
                                                                        ref={popupRef}
                                                                        style={{
                                                                            position: "fixed",
                                                                            top: popupPosition.top,
                                                                            left: popupPosition.left,
                                                                            transform:
                                                                                popupPlacement === "left" || popupPlacement === "right"
                                                                                    ? "translateY(-50%)"
                                                                                    : "none",
                                                                            maxHeight: "min(70vh, 480px)",
                                                                        }}
                                                                        className="
                                                                            relative
                                                                            w-[min(288px,calc(100vw-32px))]
                                                                            wrap-break-words
                                                                            rounded-xl
                                                                            border 
                                                                            border-gray-200
                                                                            bg-white
                                                                            p-3
                                                                            text-left
                                                                        "
                                                                    >
                                                                        {/* Pointer */}
                                                                        <div
                                                                            className={`
                                                                                absolute
                                                                                z-10
                                                                                h-0
                                                                                w-0
                                                                                border-solid
                                                                                ${
                                                                                    popupPlacement === "right"
                                                                                        ? `
                                                                                            -left-2
                                                                                            border-y-8
                                                                                            border-y-transparent
                                                                                            border-r-8
                                                                                            border-r-white
                                                                                        `
                                                                                        : popupPlacement === "left"
                                                                                        ? `
                                                                                            -right-2
                                                                                            border-y-8
                                                                                            border-y-transparent
                                                                                            border-l-8
                                                                                            border-l-white
                                                                                        `
                                                                                        : popupPlacement === "bottom"
                                                                                        ? `
                                                                                            -top-2
                                                                                            border-x-8
                                                                                            border-x-transparent
                                                                                            border-b-8
                                                                                            border-b-white
                                                                                        `
                                                                                        : `
                                                                                            -bottom-2
                                                                                            border-x-8
                                                                                            border-x-transparent
                                                                                            border-t-8
                                                                                            border-t-white
                                                                                        `
                                                                                }
                                                                            `}
                                                                            style={
                                                                                popupPlacement === "left" || popupPlacement === "right"
                                                                                    ? {
                                                                                        top: pointerOffset,
                                                                                        transform: "translateY(-50%)",
                                                                                    }
                                                                                    : {
                                                                                        left: pointerOffset,
                                                                                        transform: "translateX(-50%)",
                                                                                    }
                                                                            }
                                                                        />

                                                                        {/* Keep content above the pointer */}
                                                                        <div className="relative z-20">
                                                                            <p className="mb-2 text-xs font-semibold text-gray-400">
                                                                                PROJECTS USING {parsed.name.toUpperCase()}
                                                                            </p>

                                                                            {matchingProjects.length > 0 ? (
                                                                                <div className="flex flex-col gap-1">
                                                                                    {matchingProjects.map((project) => (
                                                                                        <button
                                                                                            key={project.id}
                                                                                            onClick={() => {
                                                                                                setActiveTech(null);
                                                                                                if (project.link) {
                                                                                                    window.open(project.link, "_blank", "noopener,noreferrer");
                                                                                                }
                                                                                            }}
                                                                                            className={`
                                                                                                w-full 
                                                                                                rounded-md 
                                                                                                px-2 
                                                                                                py-2
                                                                                                text-left 
                                                                                                text-sm 
                                                                                                text-gray-700
                                                                                                ${project.link 
                                                                                                    ? "cursor-pointer hover:bg-gray-100" 
                                                                                                    : ""
                                                                                                }
                                                                                            `}
                                                                                        >
                                                                                            {project.name}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-sm text-gray-500">
                                                                                    No projects use this technology yet.
                                                                                </p>
                                                                            )}

                                                                            <button
                                                                                onClick={() => setActiveTech(null)}
                                                                                className="
                                                                                    mt-2 
                                                                                    text-xs 
                                                                                    text-gray-400 
                                                                                    hover:text-gray-700
                                                                                    cursor-pointer
                                                                                "
                                                                            >
                                                                                Close
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })(),
                                                            document.body
                                                        )
                                                    }

                                                </div>


                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </FadeInOnView>
                    );
                })}
            </div>
        </div>
    );
}