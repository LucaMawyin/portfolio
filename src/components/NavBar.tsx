"use client";

import { useEffect, useRef, useState } from "react";
import { capitalizeNamesAndTitles } from "@/lib/capitalizeNamesAndTitles";
import { icons, pages } from "@/lib/info";
import { usePathname, useRouter } from "next/navigation";
import { Page } from "@/lib/types";
import { getHref } from "@/lib/getHref";
import { BriefcaseBusiness, Circle, FileText, FolderGit2, GraduationCap, House, LogOut, Menu, Settings, UserRound, Wrench, X } from "lucide-react";
import Link from "next/link";

export default function NavBar(props : {isLoggedIn : boolean, children?: React.ReactNode}){

    // Checking what pages are allowed to be shown to user
    const visiblePages = pages.filter(page =>
        !page.requireLogin || props.isLoggedIn
    );

    // Handling clicks on navbar links
    const [pendingScroll, setPendingScroll] = useState<{
        path: string;
        id: string;
    } | null>(null);

    const [bottomMenuOpen, setBottomMenuOpen] = useState(false);
    const bottomMenuRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!bottomMenuOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                bottomMenuRef.current &&
                !bottomMenuRef.current.contains(e.target as Node)
            ) {
                setBottomMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [bottomMenuOpen]);
    
    const router = useRouter();
    const pathname = usePathname();
    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        page: Page
    ) => {
        if (page.newTab) return;

        e.preventDefault();

        const isHomeSection = pages.some(
            (p) =>
                p.href === "/" &&
                p.section &&
                `/${p.section}` === pathname
        );

        const isHome = pathname === "/" || isHomeSection;

        // Home link: scroll to the top
        if (page.title === "home") {
            if (isHome) {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });

                window.history.replaceState(null, "", "/");
            } else {
                router.push("/");
            }

            return;
        }

        // Section links
        if (page.section) {
            if (!isHome) {
                setPendingScroll({
                    path: "/",
                    id: page.section,
                });

                router.push("/");
                return;
            }

            document.getElementById(page.section)?.scrollIntoView({
                behavior: "smooth",
            });

            return;
        }

        // Other pages
        router.push(page.href);
    };

    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        const isHomeSection = pages.some(
            (page) =>
                page.href === "/" &&
                page.section &&
                `/${page.section}` === pathname
        );

        if (pathname === "/" || isHomeSection) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            window.history.replaceState(null, "", "/");
        } else {
            router.push("/");
        }
    };

    // Scroll to section if user clicks link before page has loaded
    useEffect(() => {
        if (!pendingScroll) return;
        if (pathname !== "/") return;

        const el = document.getElementById(pendingScroll?.id);

        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            setPendingScroll(null);
        }
    }, [pathname, pendingScroll]);

    // Show navbar on scroll or if not on home page
    const isHome = pathname === "/";
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        if (!isHome) {
            setScrolled(true);
            return;
        }

        const onScroll = () => {
            setScrolled(window.scrollY > 100);
        };

        window.addEventListener("scroll", onScroll);
        onScroll();

        return () => window.removeEventListener("scroll", onScroll);
    }, [isHome]);

    const visible = isHome ? scrolled : true;

    // Locking page when mobile navbar is dropped
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    // Override open state if window is brought back to large
    useEffect(() => {
        const media = window.matchMedia("(min-width: 768px)");

        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            if (e.matches) {
                setOpen(false);
            }
        };

        // initial check (important if user loads already on desktop)
        if (media.matches) {
            setOpen(false);
        }

        media.addEventListener("change", handleChange);

        return () => media.removeEventListener("change", handleChange);
    }, []);

    return (
        <>
            <header 
                className={`
                    fixed top-4 left-1/2 -translate-x-1/2 z-50
                    w-[calc(100%-2rem)] lg:w-fit
                    max-w-full

                    rounded-full
                    border border-gray-200
                    shadow-md
                    bg-(--bg)

                    transition-all duration-150 ease-out
                    ${visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-4 pointer-events-none"
                    }
                `}
            >

                {/* Desktop navbar */}
                <div className="
                    hidden lg:flex
                    items-center justify-between
                    gap-10
                    px-6 py-3
                    text-base
                    whitespace-nowrap
                ">
                    <a
                        href="/"
                        onClick={handleHomeClick}
                        className="
                            transition-transform duration-(--transition-duration)
                            hover:scale-(--link-scale)
                        "
                    >
                        Luca Mawyin
                    </a>
                    <div className="flex gap-8">
                        {visiblePages
                            .filter((page) => (!page.mobile && page.show))
                            .map((page) => (
                            <a
                                key={page.title}
                                href={getHref(page)}
                                onClick={(e) => {
                                    handleClick(e, page);
                                }}
                                target={page.newTab ? "_blank" : undefined}
                                className="
                                    transition-transform duration-(--transition-duration)
                                    hover:scale-(--link-scale)
                                "
                            >
                                {capitalizeNamesAndTitles(page.title)}
                            </a>
                            ))
                        }                    
                    </div>

                </div>

                {/* Mobile name + social links */}
                <div className="
                    flex lg:hidden
                    items-center justify-between
                    gap-3
                    px-4 py-3
                ">
                    <a
                        href="/"
                        aria-label="Go to homepage"
                        className="transition-transform duration-200 hover:scale-110"
                        onClick={handleHomeClick}
                    >
                        Luca Mawyin
                    </a>

                    <div className="flex items-center gap-6">
                        {icons.map((icon) => (
                            <a
                                key={icon.title}
                                href={icon.href}
                                aria-label={`${icon.title} profile`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    transition-transform duration-200
                                    hover:scale-110
                                "
                            >
                                <img
                                    src={`/icons/${icon.title}.svg`}
                                    alt={icon.title}
                                    className="w-7 h-7 block squircle"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            </header>   

            {/* Desktop social links pill */}
            <div
                className={`
                    hidden lg:flex
                    fixed top-18 left-1/2
                    -translate-x-1/2 z-40

                    items-center gap-6
                    px-4 py-2

                    rounded-full
                    border border-gray-200
                    shadow-sm
                    bg-(--bg)

                    transition-all duration-150 ease-out
                    ${visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                    }
                `}
            >
                {icons.map((icon) => (
                    <a
                        key={icon.title}
                        href={icon.href}
                        aria-label={`${icon.title} profile`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-transform duration-200 hover:scale-110"
                    >
                        <img
                            src={`/icons/${icon.title}.svg`}
                            alt={icon.title}
                            className="w-7 h-7 block squircle"
                        />
                    </a>
                ))}
            </div>

            <div
                className={`
                    flex
                    flex-col
                    min-h-screen
                    transition-[padding] duration-150
                    ${visible ? "pb-14 sm:pb-0" : "pb-0"}
                `}
            >
                {props.children}
            </div>

            <header 
                ref={bottomMenuRef}
                className={`
                    block
                    lg:hidden
                    fixed 
                    bottom-4
                    sm:top-4
                    left-1/2 
                    -translate-x-1/2
                    z-50
                    w-56
                    overflow-visible

                    transition-all duration-150 ease-out
                    ${visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }
                `}
            >
                {/* EXPANDABLE MENU */}
                <div
                    className={`
                        absolute bottom-10 sm:bottom-auto sm:top-14 left-0
                        w-full
                        origin-bottom sm:origin-top
                        transition-all duration-300 ease-out
                        ${bottomMenuOpen
                            ? "translate-y-0 scale-y-100 opacity-100 pointer-events-auto"
                            : "translate-y-4 sm:-translate-y-4 scale-y-0 opacity-0 pointer-events-none"
                        }
                    `}
                >
                    <div className="
                        flex flex-col gap-2 p-4
                        rounded-2xl
                        bg-(--bg)
                        border border-gray-300
                        shadow-lg
                        mb-3
                    ">

                        {visiblePages
                            .filter((page) => page.show)
                            .map((page) => {
                                const title = page.title.toLowerCase();

                                const Icon =
                                    title === "home" ? House :
                                    title.includes("experience") ? BriefcaseBusiness :
                                    title.includes("education") ? GraduationCap :
                                    title.includes("project") ? FolderGit2 :
                                    title.includes("about") ? UserRound :
                                    title.includes("settings") ? Settings :
                                    title.includes("tech") ? Wrench :
                                    title.includes("logout") || title.includes("log out") ? LogOut :
                                    title.includes("resume") ? FileText :
                                    Circle;

                                return (
                                    <a
                                        key={page.title}
                                        href={getHref(page)}
                                        target={page.newTab ? "_blank" : undefined}
                                        onClick={(e) => {
                                            setBottomMenuOpen(false);
                                            handleClick(e, page);
                                        }}
                                        className="
                                            flex items-center gap-4
                                            rounded-lg px-2 py-2
                                            text-base
                                            transition-colors duration-200
                                            hover:bg-gray-100
                                        "
                                    >
                                        <Icon size={20} strokeWidth={1.75} />
                                        <span>
                                            {capitalizeNamesAndTitles(page.title)}
                                        </span>
                                    </a>
                                );
                            })}
                    </div>
                </div>

                {/* Persistent ball */}
                <button
                    aria-label={bottomMenuOpen
                        ? "Close floating navigation menu"
                        : "Open floating navigation menu"
                    }
                    aria-expanded={bottomMenuOpen}
                    onClick={() => setBottomMenuOpen((prev) => !prev)}
                    className="
                        relative z-10
                        flex items-center justify-center
                        w-12 h-12
                        mx-auto
                        rounded-full
                        bg-(--bg)
                        border border-gray-300
                        shadow-lg
                        sm:bg-transparent
                        sm:border-transparent
                        sm:shadow-none
                        hover:scale-110
                        transition-transform duration-200
                        cursor-pointer
                    "
                >
                    <span
                        className={`
                            absolute inset-0
                            flex items-center justify-center
                            transition-all duration-200
                            ${bottomMenuOpen
                                ? "rotate-90 scale-100 opacity-100"
                                : "rotate-0 scale-100 opacity-100"
                            }
                        `}
                    >
                        {bottomMenuOpen
                            ? <X size={21} strokeWidth={1.75} />
                            : <Menu size={21} strokeWidth={1.75} />
                        }
                    </span>
                </button>
            </header>
        </>


    );
}