"use client";

import ExperienceClient from "@/components/Experience";
import FadeInOnView from "@/components/FadeInOnView";
import Projects from "@/components/Projects";
import TechStack from "@/components/Tech";
import { capitalizeNamesAndTitles } from "@/lib/capitalizeNamesAndTitles";
import { getHref } from "@/lib/getHref";
import { icons, pages } from "@/lib/info"; 
import { Experience, Project, SiteContent, Tech } from "@/lib/types";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function HomeClient(props : 
    {
        isLoggedIn : boolean, 
        projects : Project[],
        tech : Tech[],
        content : SiteContent,
        experience : Experience[],
    }) {

    // Getting pages that are visible to user
    const visiblePages = pages.filter(page =>
        !page.requireLogin || props.isLoggedIn
    );

    // Page animation on load
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        setLoaded(true);
    }, []);

    // Scroll to section if URL has section on load
    const pathname = usePathname();
    useEffect(() => {

        if (pathname === "/") return;

        const section = pathname.replace("/", "");
        const validSections = pages
            .filter(page => page.section)
            .map(page => page.section);
        
        if (!validSections.includes(section)) return;

        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: "auto", block: "start" });
        }

    }, []);

    // Change URL depending on section
    useEffect(() => {
        const sections = document.querySelectorAll("section[id]");

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible.length > 0) {
                    const id = visible[0].target.id;
                    visible[0].target.classList.add("show");
                    window.history.replaceState(
                        null,
                        "",
                        id === "hero" ? "/" : id
                    );
                }
            },
            {
                root: null,
                threshold: 0,
                rootMargin: "-45% 0px -45% 0px"
            }
        );

        sections.forEach((s) => observer.observe(s));

        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* Hero */}
            <section 
                id="hero"
                className="
                    relative
                    min-h-screen
                    w-full
                    flex justify-center items-center
            ">
                <div className="
                    w-fit
                    m-4
                ">

                    {/* Icon Row on hero */}
                    <div className="flex flex-row gap-6">
                        {icons.map((icon) => (
                            <a
                                key={icon.title}
                                href={icon.href}
                                target="_blank"
                                className={`
                                    flex items-center justify-center
                                    transition-all duration-(--transition-duration) ease-out

                                    hover:scale-(--link-scale)

                                    ${loaded 
                                        ? "opacity-100 translate-y-0" 
                                        : "opacity-0 translate-y-4"
                                    }
                                `}
                            >
                                <img
                                    src={`/icons/${icon.title}.svg`}
                                    alt={icon.title}
                                    className="h-[clamp(3rem,5vw,4rem)] squircle"
                                />
                            </a>
                        ))}
                    </div>

                    {/* Hero name */}
                    <h1 
                        className={`
                            mb-2
                            sm:mb-0
                            transition-all duration-700 ease-out
                            ${loaded ? "opacity-100 translate-y-0" : "opacity-[0.01] translate-y-4"}
                    `}>
                        Luca Mawyin
                    </h1>

                    {/* Hero links */}
                    <div className="
                        flex flex-col
                        w-fit
                        text-2xl
                        gap-[clamp(1rem,5vh,2.5rem)]
                    ">
                        {visiblePages
                            .filter((page) => (!page.mobile && page.show))
                            .map((page, index) => (
                                <a
                                    key={page.title}
                                    href={getHref(page)}
                                    target={page.newTab ? "_blank" : undefined}
                                    className={`
                                        relative w-fit

                                        after:content-['']
                                        after:absolute after:left-0 after:bottom-0
                                        after:h-0.5 after:w-full
                                        after:scale-x-0
                                        after:origin-left
                                        after:bg-black
                                        after:transition-transform
                                        after:duration-300

                                        hover:after:scale-x-100
                                        transition-all duration-500 ease-out
                                        ${loaded 
                                            ? "opacity-100 translate-y-0" 
                                            : "opacity-0 translate-y-4"
                                        }
                                    `}
                                    style={{
                                        transitionDelay: `${(index+1) * 200}ms`
                                    }}
                                >
                                    {`${capitalizeNamesAndTitles(page.title)}`}
                                </a>
                            ))
                        }				
                    </div>

                </div>

                {/* Scroll down arrow */}
                <a 
                    href="#about" 
                    aria-label="Scroll to about section"
                    className="
                        absolute 
                        bottom-6 
                        left-1/2 
                        -translate-x-1/2 
                        opacity-0 
                        animate-arrow-entry
                    "
                >
                    <div className="animate-bounce-slow">
                        <svg
                            className="w-6 h-6 text-black"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </a>

            </section>

            {/* About me */}
            <section id="about" className="min-h-[75vh]!">
                <div className="
                    w-full
                    flex flex-wrap-reverse
                    px-[15%]
                    sm:px-[10%]
                    md:py-0
                    py-[5%]
                    justify-between
                    my-auto
                ">  
                    <FadeInOnView className="
                        basis-full
                        w-full lg:basis-1/2
                        text-center sm:text-left
                        sm:fade-left
                    ">

                        <h1 className="pt-6">About Me</h1>
                        <div className="
                            mb-8 
                            whitespace-pre-line 
                            prose 
                            leading-normal
                            prose-a:text-blue-500 prose-a:underline hover:prose-a:text-blue-700
                        ">
                            <div className="**:mb-0">
                                <ReactMarkdown
                                    components={{
                                        a:({node, ...props}) => (
                                            <a
                                                {...props}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            />
                                        ),
                                    }}
                                >
                                    {props.content.about}
                                </ReactMarkdown>                                
                            </div>

                        </div>
                    </FadeInOnView>

                    <FadeInOnView className="
                        overflow-hidden
                        w-full 
                        lg:max-w-[25%]
                        flex 
                        justify-center
                        sm:fade-right
                    ">
                        <img
                            src={`/images/headshot?v=${props.content.headshot_updated_at}`}
                            alt="Luca Mawyin"
                            className="my-auto w-full h-auto object-contain rounded-2xl"
                        />
                    </FadeInOnView>
                </div>

            </section>	

            {/* Projects */}
            <section id="projects">
                <Projects 
                    isLoggedIn={props.isLoggedIn}
                    projects={props.projects}
                />
            </section>

            {/* TECH I USE */}
            <section id="tech" className="min-h-fit! my-[5%]">
                <TechStack 
                    isLoggedIn={props.isLoggedIn}
                    tech={props.tech}
                />
            </section>

            {/* EXPERIENCE */}
            <section id="experience">
                <ExperienceClient
                    experienceList={props.experience}
                    isLoggedIn={props.isLoggedIn}
                />
            </section>
        </>

    );

}