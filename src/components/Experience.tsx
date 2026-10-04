"use client";

import { Experience } from "@/lib/types";
import FadeInOnView from "./FadeInOnView";
import Button from "./Button";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { formatToMonthYear } from "@/lib/formatMonthYear";
import DeleteButton from "./DeleteButton";
import { useState } from "react";
import Badge from "./Badge";


export default function ExperienceClient(props: { isLoggedIn:boolean; experienceList: Experience[] }) {

    const router = useRouter();
    const [experience, setExperience] = useState<Experience[]>(
        props.experienceList.filter(e => !e.tag?.includes("Certificate"))
    );
    const [certificates, setCertificates] = useState<Experience[]>(
        props.experienceList.filter(e => e.tag?.includes("Certificate"))
    );
    
    return (
        <div
            className="
                flex 
                w-full 
                flex-col 
                items-center 
                py-4 
                px-4
            "
        >
            <FadeInOnView>
                <h1 className={`
                    text-3xl 
                    font-bold

                    ${props.isLoggedIn ? "" : "pb-8 sm:pb-0"}
                `}>
                    Experience
                </h1>
                
                {/* Add Experience button if logged in */}
                {props.isLoggedIn && 
                    <div className="
                        flex 
                        w-full
                        justify-center
                        p-4 sm:p-0 sm:pt-4
                    ">
                        <Button 
                            text="Add Experience"
                            onClick={() => (router.push("/add-experience"))}
                        />            
                    </div>
        
                }
            </FadeInOnView>



            <div className="relative w-full my-[2.5%]">



                <div className="
                    absolute
                    hidden md:block
                    left-1/2
                    top-0
                    bottom-0
                    w-0.5
                    bg-neutral-300
                    -translate-x-1/2
                " />

                {/* EXPERIENCE */}
                <div className={`
                    relative
                    w-full
                    h-full
                    grid
                    auto-rows-fr
                    gap-8
                    md:gap-0
                    p-[2.5%]
                    py-0
                `}>

                    {/* CENTER LINE */}

                    {experience.map((exp,index) => (
                        <div 
                            key={index}
                            className={`
                                flex 
                                flex-col
                                w-full
                                h-full
                                lg:px-[5%]
                                gap-8
                                ${index !== 0 ? "md:translate-y-[-10%]" : ""}
                            `}
                            style={{
                                zIndex: experience.length - index
                            }}
                        >

                            {/* CARD & DOT */}
                            <div className="
                                relative
                                flex
                                flex-col
                                gap-8
                                w-full
                                h-full
                            ">
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
                                        gap-4
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
                                    `}
                                >
                                    {/* TITLE + DATE */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                        <h2 className="
                                            text-lg 
                                            sm:text-xl 
                                            font-semibold 
                                            md:max-w-[50%]
                                        ">
                                            {exp.title}
                                        </h2>

                                        <p className="hidden sm:inline text-neutral-400">• </p>

                                        <p className="text-sm text-neutral-500">
                                            <span className="whitespace-nowrap">
                                                {formatToMonthYear(exp.start_date)}
                                            </span> 
                                            {" - "}
                                            <span className="whitespace-nowrap">
                                                {exp.end_date ? formatToMonthYear(exp.end_date) : "Present"}
                                            </span>
                                        </p>                                            



                                    </div>

                                    {/* COMPANY + LOCATION */}
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
                                    
                                    {/* TAG */}
                                    {exp.tag && (
                                        <div>
                                            <Badge
                                                text={exp.tag}
                                                px={2}
                                                py={1}
                                                textSize="xs"
                                                shadow="none"
                                                className="
                                                    text-neutral-600! 
                                                    bg-neutral-200
                                                "
                                            />
                                        </div>
                                    )}
                                    
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

                                </FadeInOnView>
                            </div>


                            {/* BUTTONS */}
                            {props.isLoggedIn && (
                                <div className={`
                                    flex 
                                    h-fit
                                    w-full 
                                    md:w-[45%] 
                                    justify-between
                                    ${index % 2 === 0 
                                        ? "md:self-start" 
                                        : "md:self-end"
                                    }
                                `}>
                                    <Button
                                        text="Edit"
                                        className="min-w-32 h-fit"
                                        onClick={() => {router.push(`add-experience/edit?id=${exp.id}`)}}
                                    />
                                    <DeleteButton
                                        className="min-w-32 h-fit"
                                        text="Experience"
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
                            
                        </div>
                        
                    ))}
                </div>

                {/* CERTIFICATES */}
                {certificates.length > 0 && (
                    <h2 className="
                        relative
                        text-center
                        text-2xl
                        font-bold
                        md:translate-y-[-2vh]
                        my-[5%]
                        md:my-0
                        bg-(--bg)
                    ">
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
                    p-[2.5%] 
                    py-0 
                ">
                    {certificates.map((cert,index) => (
                        <div 
                            key={index}
                            className={`
                                flex 
                                flex-col
                                w-full
                                h-full
                                lg:px-[5%]
                                gap-8
                                ${index !== 0 ? "md:translate-y-[-10%]" : ""}
                            `}
                            style={{
                                zIndex: certificates.length - index
                            }}
                        >

                            {/* CARD & DOT */}
                            <div className="
                                relative
                                flex
                                flex-col
                                gap-8
                                w-full
                                h-full
                            ">
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
                                        gap-4
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
                                    `}
                                >
                                    {/* TITLE + DATE */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                        <h2 className="
                                            text-lg 
                                            sm:text-xl 
                                            font-semibold 
                                            max-w-[50%]
                                        ">
                                            {cert.title}
                                        </h2>

                                        <p className="hidden sm:inline text-neutral-400">• </p>

                                        <p className="text-sm text-neutral-500">
                                            <span className="whitespace-nowrap">
                                                {formatToMonthYear(cert.start_date)}
                                            </span> 
                                            {cert.end_date && " - "}
                                            <span className="whitespace-nowrap">
                                                {cert.end_date ? formatToMonthYear(cert.end_date) : ""}
                                            </span>
                                        </p>                                            



                                    </div>

                                    {/* COMPANY + LOCATION */}
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

                                    {/* TAG */}
                                    {cert.tag && (
                                        <div>
                                            <Badge
                                                text={cert.tag}
                                                px={2}
                                                py={1}
                                                textSize="xs"
                                                shadow="none"
                                                className="
                                                    text-neutral-600! 
                                                    bg-neutral-200
                                                "
                                            />
                                        </div>
                                    )}
                                    
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

                                </FadeInOnView>
                            </div>


                            {/* BUTTONS */}
                            {props.isLoggedIn && (
                                <div className={`
                                    flex 
                                    h-fit
                                    w-full 
                                    md:w-[45%] 
                                    justify-between
                                    ${((experience.length + index) % 2 === 0)
                                        ? "md:self-start"
                                        : "md:self-end"
                                    }
                                `}>
                                    <Button
                                        text="Edit"
                                        className="min-w-32 h-fit"
                                        onClick={() => {router.push(`add-experience/edit?id=${cert.id}`)}}
                                    />
                                    <DeleteButton
                                        className="min-w-32 h-fit"
                                        text="Experience"
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
                                        
                                            setCertificates((prev) =>
                                                prev.filter((p) => p.id !== cert.id)
                                            );
                                        }}
                                    />                        
                                </div>
        
        
                            )}
                            
                        </div>
                        
                    ))}
                </div>

            </div>

        </div>
    );
}
