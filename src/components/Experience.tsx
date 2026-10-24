"use client";

import { Experience } from "@/lib/types";
import FadeInOnView from "./FadeInOnView";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { formatToMonthYear } from "@/lib/formatMonthYear";
import DeleteButton from "./DeleteButton";
import { useState } from "react";
import Badge from "./Badge";
import AddButton from "./AddButton";
import EditButton from "./EditButton";
import { shadow } from "@/lib/tags";


export default function ExperienceClient(props: { isLoggedIn:boolean; experienceList: Experience[] }) {

    const router = useRouter();
    const [experience, setExperience] = useState<Experience[]>(
        props.experienceList.filter(e => !e.tag?.toLowerCase().includes("certificate"))
    );
    const [certificates, setCertificates] = useState<Experience[]>(
        props.experienceList.filter(e => e.tag?.toLowerCase().includes("certificate"))
    );

    const titleOffset =
        Math.max(0, experience.length - certificates.length) * 4;


    const totalTranslateY =
        certificates.length > 0
            ? `calc(${titleOffset}vh + ${(certificates.length - 1) * 64}px)`
            : "0px";

    const wrapperOffset =
        certificates.length > 0
            ? `calc(-${certificates.length * titleOffset}vh - ${
                (certificates.length * (certificates.length - 1) / 2) * 64
            }px)`
            : "0px";
    
    return (
        <div
            className="
                flex
                w-full
                flex-col
                items-center
                py-4
                px-4
                md:mb-(--wrapper-offset)
            "
            style={{
                "--wrapper-offset": wrapperOffset,
            } as React.CSSProperties}
        >
            <FadeInOnView>
                <h1 className={`
                    text-3xl 
                    font-bold

                    ${props.isLoggedIn ? "pb-4" : "pb-8 sm:pb-0"}
                `}>
                    Experience
                </h1>
                
                {/* Add Experience button if logged in */}
                {props.isLoggedIn && (
                    <div
                        className="
                            flex
                            w-full
                            justify-center
                            pb-4 sm:pb-0
                        "
                    >
                        <AddButton
                            text="Add Experience"
                            x={4}
                            y={2}
                            action={() => (router.push("/add-experience"))}
                        />

                    </div>
                )}
            </FadeInOnView>



            <div className="relative w-full my-[2.5%]">

                {/* CENTER LINE */}
                <div
                    className="
                        absolute
                        hidden md:block
                        left-1/2
                        top-0
                        w-0.5
                        bg-neutral-300
                        -translate-x-1/2
                    "
                    style={{
                        bottom: totalTranslateY,
                    }}
                />

                {/* EXPERIENCE */}
                <div className={`
                    relative
                    w-full
                    h-full
                    grid
                    auto-rows-fr
                    gap-8
                    md:gap-0
                    lg:px-[5%] 
                `}>

                    {experience.map((exp,index) => {

                        const { 
                            glowColour: statusGlowColour, 
                            glowRGB: statusGlowRGB, 
                            borderColour: statusBorderColour
                        } = shadow(exp.status_colour);
                        
                        return (
                            <div
                                key={index}
                                className="
                                    timeline-card-offset 
                                    relative 
                                    flex 
                                    flex-col 
                                    w-full 
                                    h-full 
                                    gap-8
                                "
                                style={{
                                    zIndex: experience.length - index,
                                    "--card-offset": `${-index * 64}px`,
                                } as React.CSSProperties}
                            >

                                {/* CARD & DOT */}

                                {/* DOT */}
                                <div className="
                                    hidden md:block
                                    absolute
                                    left-1/2
                                    top-1/2
                                    w-4 h-4
                                    rounded-full
                                    bg-neutral-400
                                    -translate-x-1/2
                                    -translate-y-1/2
                                    z-10
                                " />

                        
                                <FadeInOnView
                                    className={`
                                        flex
                                        flex-col
                                        rounded-xl
                                        shadow-[0_4px_10px_rgba(0,0,0,0.08),0_-1px_3px_rgba(0,0,0,0.04)]
                                        p-6
                                        gap-3
                                        w-full
                                        h-full
                                        md:w-[45%]
                                        ${index % 2 === 0 
                                            ? "md:self-start" 
                                            : "md:self-end"
                                        }
                                        squircle-large
                                        pillow
                                        ${index % 2 === 0 ? "sm:fade-left" : "sm:fade-right"}
                                        ${
                                            exp.link 
                                            ? `
                                                cursor-pointer 
                                                pillow-hover
                                                hover:scale-(--subtle-scale)
                                                active:scale-(--subtle-scale)
                                            `
                                            : ""
                                        }
                                    `}
                                    onClick={() => {
                                        if (exp.link) window.open(exp.link, "_blank", "noopener,noreferrer");
                                    }}
                                >
                                    {/* HEADER */}
                                    <div className="flex flex-col gap-3">

                                        {/* TITLE & BADGE */}
                                        <div className="
                                            flex 
                                            flex-row 
                                            w-full
                                            justify-between
                                            items-start
                                            gap-3
                                        ">
                                            <h2 className="
                                                min-w-0
                                                flex-1
                                                text-lg
                                                sm:text-xl
                                                font-semibold
                                                wrap-anywhere
                                            ">
                                                {exp.title}
                                            </h2>
                                            <div>
                                                {exp.status && (
                                                    
                                                    <Badge
                                                        text={exp.status}
                                                        style={{
                                                            "--glow": statusGlowRGB,
                                                            backgroundColor: exp.status_colour,
                                                            borderColor: statusBorderColour,
                                                            color: statusGlowColour,
                                                        } as React.CSSProperties}
                                                        className="
                                                            w-fit!
                                                            mt-0.5
                                                            z-10
                                                            border
                                                            animate-tag-pulse
                                                            animate-tag-text
                                                        "
                                                    />
                                                )}
                                                
                                            </div>

                                        </div>


                                        <p className="text-sm text-neutral-500">
                                            <span className="whitespace-nowrap">
                                                {formatToMonthYear(exp.start_date)}
                                            </span> 
                                            {" - "}
                                            <span className="whitespace-nowrap">
                                                {exp.end_date ? formatToMonthYear(exp.end_date) : "Present"}
                                            </span>
                                        </p>        


                                        {/* COMPANY & LOCATION */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                            <span className="text-sm">
                                                {exp.company}
                                            </span>

                                            <span className="hidden sm:inline text-neutral-400">|</span>

                                            <span className="text-sm text-neutral-500">
                                                {exp.city && exp.city}
                                                {exp.city && exp.region && `, ${exp.region}`}
                                                {!exp.city && exp.region && exp.region}
                                            </span>
                                        </div>

                                        {/* TAG + HIDDEN */}
                                        <div className="flex flex-row gap-2">
                                            {exp.tag && (
                                                <Badge
                                                    text={exp.tag}
                                                    shadow="none"
                                                    className="
                                                        text-neutral-600! 
                                                        bg-neutral-200
                                                    "
                                                />                                                    
                                            )}

                                            {(exp.hidden === 1) && (
                                                <Badge
                                                    text="Hidden"
                                                    shadow="none"
                                                    className="bg-orange-400"
                                                />
                                            )}    

                                        </div>

                                    </div>
                                    
                                    <div className="text-sm mt-2">
                                        <ReactMarkdown
                                            components={{
                                                ul: ({ ...props }) => (
                                                    <ul className="list-disc pl-5 space-y-1" {...props} />
                                                ),
                                                li: ({ ...props }) => (
                                                    <li {...props} />
                                                ),
                                            }}
                                            >
                                            {exp.description}
                                        </ReactMarkdown>
                                    </div>

                                    
                                    {props.isLoggedIn && (
                                        <div className="flex w-full justify-between mt-auto">
                                            <EditButton
                                                action={() => {router.push(`add-experience/edit?id=${exp.id}`)}}
                                            />
                                            <DeleteButton
                                                itemName={exp.title}
                                                action={async () => {
                                                const res = await fetch("/api/experience", {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify({ id: exp.id }),
                                                });
                    
                                                if (res.status === 401) {
                                                    router.push("/login");
                                                    return;
                                                }
                                                
                                                    setExperience((prev) =>
                                                        prev.filter((p) => p.id !== exp.id)
                                                    );
                                                }}
                                            /> 
                                        </div>
                                    )}
                                </FadeInOnView>
                            </div>
                            
                        )
                    })}
                </div>

                {/* CERTIFICATES */}
                {certificates.length > 0 && (
                    <h2
                        className="
                            timeline-card-offset
                            relative
                            text-center
                            text-4xl
                            md:text-2xl
                            font-bold
                            my-12
                            md:my-0
                            bg-(--bg)
                        "
                        style={{
                            "--card-offset": `-${Math.min(
                                20,
                                Math.max(0, experience.length - certificates.length) * 5
                            )}vh`,
                        } as React.CSSProperties}
                    >
                        Certificates
                    </h2>
                )}


                <div className=" 
                    relative 
                    w-full 
                    grid 
                    auto-rows-fr 
                    gap-8 
                    md:gap-0 
                    lg:px-[5%] 
                ">
                    {certificates.map((cert,index) => {

                        const { 
                            glowColour: statusGlowColour, 
                            glowRGB: statusGlowRGB, 
                            borderColour: statusBorderColour
                        } = shadow(cert.status_colour);

                        const titleOffset =
                            Math.max(0, experience.length - certificates.length) * 4;

                        return (
                            <div
                                key={index}
                                className="
                                    timeline-card-offset 
                                    relative 
                                    flex 
                                    flex-col 
                                    w-full 
                                    h-full 
                                    gap-8
                                "
                                style={{
                                    zIndex: certificates.length - index,
                                    "--card-offset": `calc(-${titleOffset}vh - ${index * 64}px)`,
                                } as React.CSSProperties}
                            >

                                {/* CARD & DOT */}

                                {/* DOT */}
                                <div className="
                                    hidden md:block
                                    absolute
                                    left-1/2
                                    top-1/2
                                    w-4 h-4
                                    rounded-full
                                    bg-neutral-400
                                    -translate-x-1/2
                                    -translate-y-1/2
                                    z-10
                                " />

                        
                                <FadeInOnView
                                    className={`
                                        flex
                                        flex-col
                                        rounded-xl
                                        shadow-[0_4px_10px_rgba(0,0,0,0.08),0_-1px_3px_rgba(0,0,0,0.04)]
                                        p-6
                                        gap-3
                                        w-full
                                        h-full
                                        md:w-[45%]
                                        ${((experience.length + index) % 2 === 0)
                                            ? "md:self-start"
                                            : "md:self-end"
                                        }
                                        ${((experience.length + index) % 2 === 0)
                                            ? "sm:fade-left"
                                            : "sm:fade-right"
                                        }
                                        squircle-large
                                        pillow
                                        ${
                                            cert.link 
                                            ? `
                                                cursor-pointer 
                                                pillow-hover
                                                hover:scale-(--subtle-scale)
                                                active:scale-(--subtle-scale)
                                            `
                                            : ""
                                        }
                                    `}
                                    onClick={() => {
                                        if (cert.link) window.open(cert.link, "_blank", "noopener,noreferrer");
                                    }}
                                >
                                    {/* HEADER */}
                                    <div className="flex flex-col gap-3">

                                        {/* TITLE & BADGE */}
                                        <div className="
                                            flex 
                                            flex-row 
                                            w-full
                                            justify-between
                                            items-start
                                            gap-3
                                        ">
                                            <h2 className="
                                                min-w-0
                                                flex-1
                                                text-lg
                                                sm:text-xl
                                                font-semibold
                                                wrap-anywhere
                                            ">
                                                {cert.title}
                                            </h2>
                                            <div>
                                                {cert.status && (
                                                    
                                                    <Badge
                                                        text={cert.status}
                                                        style={{
                                                            "--glow": statusGlowRGB,
                                                            backgroundColor: cert.status_colour,
                                                            borderColor: statusBorderColour,
                                                            color: statusGlowColour,
                                                        } as React.CSSProperties}
                                                        className="
                                                            w-fit!
                                                            mt-0.5
                                                            z-10
                                                            border
                                                            animate-tag-pulse
                                                            animate-tag-text
                                                        "
                                                    />
                                                )}
                                                
                                            </div>

                                        </div>


                                        <p className="text-sm text-neutral-500">
                                            <span className="whitespace-nowrap">
                                                {formatToMonthYear(cert.start_date)}
                                            </span> 
                                            {cert.end_date && " - "}
                                            <span className="whitespace-nowrap">
                                                {cert.end_date ? formatToMonthYear(cert.end_date) : ""}
                                            </span>
                                        </p>      


                                        {/* COMPANY & LOCATION */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                            <span className="text-sm">
                                                {cert.company}
                                            </span>

                                            {(cert.city || cert.region) && <span className="hidden sm:inline text-neutral-400">|</span>}

                                            <span className="text-sm text-neutral-500">
                                                {cert.city && cert.city}
                                                {cert.city && cert.region && `, ${cert.region}`}
                                                {!cert.city && cert.region && cert.region}
                                            </span>
                                        </div>


                                        {/* TAG + HIDDEN */}
                                        <div className="flex flex-row gap-2">
                                            {cert.tag && (
                                                <Badge
                                                    text={cert.tag}
                                                    shadow="none"
                                                    className="
                                                        text-neutral-600! 
                                                        bg-neutral-200
                                                    "
                                                />                                                    
                                            )}

                                            {(cert.hidden === 1) && (
                                                <Badge
                                                    text="Hidden"
                                                    shadow="none"
                                                    className="bg-orange-400"
                                                />
                                            )}    

                                        </div>

                                    </div>
                                    
                                    <div className="text-sm mt-2">
                                        <ReactMarkdown
                                            components={{
                                                ul: ({ ...props }) => (
                                                    <ul className="list-disc pl-5 space-y-1" {...props} />
                                                ),
                                                li: ({ ...props }) => (
                                                    <li {...props} />
                                                ),
                                            }}
                                            >
                                            {cert.description}
                                        </ReactMarkdown>
                                    </div>

                                    {props.isLoggedIn && (
                                        <div className="flex w-full justify-between mt-auto">
                                            <EditButton
                                                action={() => {router.push(`add-experience/edit?id=${cert.id}`)}}
                                            />
                                            <DeleteButton
                                                itemName={cert.title}
                                                action={async () => {
                                                const res = await fetch("/api/experience", {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify({ id: cert.id }),
                                                });
                    
                                                if (res.status === 401) {
                                                    router.push("/login");
                                                    return;
                                                }
                                                
                                                    setExperience((prev) =>
                                                        prev.filter((p) => p.id !== cert.id)
                                                    );
                                                }}
                                            /> 
                                        </div>
                                    )}

                                </FadeInOnView>



                                
                            </div>
                            
                        )
                    })}
                </div>

            </div>

        </div>
    );
}
