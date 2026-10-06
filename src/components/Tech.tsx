"use client";

import { Tech } from "@/lib/types";
import FadeInOnView from "./FadeInOnView";
import { useRouter } from "next/navigation";
import Badge from "./Badge";
import { useEffect, useState } from "react";
import { getInitials } from "@/lib/getInitials";
import EditButton from "./EditButton";

export default function TechStack(props: {
    isLoggedIn: boolean;
    tech: Tech[];
}) {
    const [highlighted, setHighlighted] = useState<Record<string, string>>({});

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
                            className="fade-left"
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
                                            const isHighlighted =
                                                highlighted[section.key] ===
                                                item.name;

                                            const initials =
                                                getInitials(item.name);

                                            return (
                                                <Badge
                                                    key={item.id}
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
                                                        transition-all
                                                        duration-500
                                                        border

                                                        ${
                                                            isHighlighted
                                                                ? `
                                                                    ${section.accent.bg}
                                                                    ${section.accent.border}
                                                                    ${section.accent.text}
                                                                    -translate-y-1
                                                                `
                                                                : `
                                                                    bg-white
                                                                    border-gray-300
                                                                `
                                                        }
                                                    `}
                                                    text={item.name}
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