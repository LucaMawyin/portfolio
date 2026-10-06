import { shadow } from "@/lib/tags";
import { Project } from "@/lib/types";
import React from "react";
import ReactMarkdown from "react-markdown";
import Badge from "./Badge";
import TechBadges from "./TechBadges";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";


export default function ProjectCard( props : {
    project : Project;
    position : "start" | "end";
    isLoggedIn : boolean;
    className?:string;
    childClassName?:string;
    onHoverStart?: () => void;
    onHoverEnd?: () => void;
    onHoldCancel?: () => void;
    onButtonHoverStart?: () => void;
    onButtonHoverEnd?: () => void;
    condenseTech?: boolean;
    holdProgress?: number;
    onEdit?: () => void;
    onDelete?: () => void;
}){
    const [isTouching, setIsTouching] = React.useState(false);

    const tools = (
    typeof props.project.tools === "string"
        ? JSON.parse(props.project.tools || "[]")
        : props.project.tools || []
    ) as string[];

    const languages = (
    typeof props.project.languages === "string"
        ? JSON.parse(props.project.languages || "[]")
        : props.project.languages || []
    ) as string[];

    const libraries = (
    typeof props.project.libraries === "string"
        ? JSON.parse(props.project.libraries || "[]")
        : props.project.libraries || []
    ) as string[];
    
    const { glowColour, glowRGB, borderColour } = shadow(props.project.colour);
    const { 
        glowColour: statusGlowColour, 
        glowRGB: statusGlowRGB, 
        borderColour: statusBorderColour
    } = shadow(props.project.status_colour);

    const [isPressed, setIsPressed] = React.useState(false);

    const isNew = new Date(props.project.created_at) >= (() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date;
    })();

    const isUpdated =
        !isNew &&
        props.project.updated_at &&
        new Date(props.project.updated_at) >= (() => {
            const date = new Date();
            date.setDate(date.getDate() - 7);
            return date;
        })();

        let isGithub = false;

        try {
            const hostname = new URL(props.project.link).hostname;
            isGithub = hostname === "github.com" || hostname.endsWith(".github.com");
        } catch {
        }

    return (
        <a
            href={props.project.link}
            target="_blank"
            className={`
                flex
                flex-col
                rounded-xl
                shadow-[0_4px_10px_rgba(0,0,0,0.08),0_-1px_3px_rgba(0,0,0,0.04)]
                w-full
                h-full
                max-w-5xl
                md:p-8
                p-4
                

                transition-all
                duration-(--transition-duration)
                ${isPressed ? "scale-(--subtle-scale) shadow-[0_8px_20px_rgba(0,0,0,0.12)]" : ""}
                hover:scale-(--subtle-scale)
                hover:shadow-[0_8px_20px_rgba(0,0,0,0.12),0_-2px_4px_rgba(0,0,0,0.05)]
                justify-evenly
                squircle-large
                pillow
                pillow-hover
                group/card
                ${props.className}
            `}
            onTouchStart={() => {
                props.onHoverStart?.();
                setIsTouching(true);
            }}
            onTouchEnd={() => {
                props.onHoverEnd?.();
                setIsTouching(false);
            }}
            onTouchCancel={() => {
                props.onHoverEnd?.();
                setIsTouching(false);
            }}
        >   

            {/* Tile title */}
            <div
                className={`
                    relative
                    flex 
                    flex-col
                    ${props.position === "start" ? "sm:flex-row" : "sm:flex-row-reverse"}
                    justify-between 
                    w-full
                    items-center 
                    sm:items-stretch 
                    gap-2
                    pb-4
                `}
            >
                <h1
                    className={`
                        text-2xl!
                        min-w-min
                        text-center
                        ${props.position === "start" ? "sm:mr-auto sm:text-left" : "sm:ml-auto sm:text-right"}
                    `}
                >
                    {props.project.name}
                </h1>
                
                {props.project.tag && (
                    
                    <Badge
                        text={props.project.tag}
                        style={{
                            "--glow" : glowRGB,
                            backgroundColor: props.project.colour,
                            borderColor: borderColour,
                            color: glowColour,
                        } as React.CSSProperties}
                        textSize="xl"
                        px={3}
                        py={0}
                        className="
                            border
                            animate-tag-pulse
                            animate-tag-text
                        "
                    />
                )}

                {props.holdProgress !== undefined && (
                    <>
                        <div
                            className="
                                absolute
                                bottom-0
                                left-0
                                right-0
                                h-px
                                bg-gray-300
                                z-10
                            "
                        />

                        <div
                            className="
                                absolute
                                bottom-0
                                left-0
                                h-0.5
                                z-20
                                transition-none
                                bg-current
                            "
                            style={{
                                width: `${props.holdProgress * 100}%`,
                            }}
                        />
                    </>
                )}
            </div>

            {/* STATUS / PIN / HIDDEN */}
            <div className={`
                min-h-8
                flex 
                ${props.position === "start" ? "sm:flex-row" : "sm:flex-row-reverse"}
                items-center 
                justify-center
                sm:justify-between
                gap-4
            `}>
                
                {(props.project.pinned === 1|| props.project.hidden === 1) && props.isLoggedIn &&(
                    <div className="flex flex-row gap-4">
                        {/* PIN */}
                        {(props.project.pinned === 1) && (
                            <Badge
                                text="Pinned"
                                className="bg-yellow-400"
                            />

                        )}

                        {/* HIDDEN */}
                        {(props.project.hidden === 1) && (
                            <Badge
                                text="Hidden"
                                className="bg-orange-400"
                            />
                        )}                    
                    </div>                    
                )}


            </div>


            {/* Tile Content */}
            <div
                className={`
                    flex
                    flex-1
                    flex-wrap
                    ${props.position === "end" ? "flex-row-reverse" : "flex-row"}
                    justify-between
                    gap-8
                    ${props.childClassName}
                `}
            >
                
                {/* Image */}
                <div className="
                    relative 
                    flex-1 
                    min-w-70! 
                    lg:min-w-0 
                    max-w-full 
                    flex 
                    justify-center 
                    items-center
                ">
                    {props.project.image && (() => {
                        return (
                            <div 
                                className="
                                    relative 
                                    flex 
                                    h-fit
                                    w-fit
                                "
                                onMouseEnter={props.onHoverStart}
                                onMouseLeave={props.onHoverEnd}
                            >
                                <div 
                                    className={`
                                        relative
                                        overflow-hidden
                                        rounded-xl
                                        transition-transform
                                        duration-300
                                        ${isTouching ? "scale-105" : ""}
                                    `}
                                >
                                    <img
                                        src={props.project.image}
                                        alt={`Project ${props.project.id}`}
                                        className={`
                                            w-full
                                            h-auto
                                            rounded-xl
                                            transition-transform
                                            duration-300
                                            group-hover/card:scale-105
                                            ${isTouching ? "scale-105" : ""}
                                        `}
                                    />

                                    <div
                                        className={`
                                            absolute
                                            inset-0
                                            flex
                                            items-center
                                            justify-center
                                            bg-black/0
                                            transition-colors
                                            duration-300
                                            group-hover/card:bg-black/50
                                            ${isTouching ? "bg-black/50" : ""}
                                        `}
                                    >
                                        <span
                                            className={`
                                                text-white
                                                font-semibold
                                                text-lg
                                                opacity-0
                                                translate-y-2
                                                transition-all
                                                duration-300
                                                group-hover/card:opacity-100
                                                group-hover/card:translate-y-0
                                                ${isTouching ? "opacity-100 translate-y-0" : ""}
                                            `}
                                        >
                                            {isGithub ? "View Code" : "Visit Website"} ↗
                                        </span>
                                    </div>
                                </div>       

                                {isNew && (
                                    <Badge
                                        text="NEW"
                                        animateText
                                        className="
                                            absolute
                                            top-3
                                            left-3
                                            z-10
                                            bg-yellow-300
                                            text-yellow-950
                                            border-2
                                            border-yellow-400
                                            shadow-lg
                                            animate-new-badge
                                        "
                                        px={3}
                                        py={1}
                                    />
                                )}

                                {isUpdated && (
                                    <Badge
                                        text="UPDATED"
                                        animateText
                                        className="
                                            absolute
                                            top-3
                                            left-3
                                            z-10
                                            bg-blue-300
                                            text-blue-950
                                            border-2
                                            border-blue-400
                                            shadow-lg
                                            animate-updated-badge
                                        "
                                        px={3}
                                        py={1}
                                    />
                                )}

                                {props.project.status && (
                                    <Badge
                                        text={props.project.status}
                                        style={{
                                            "--glow": statusGlowRGB,
                                            backgroundColor: props.project.status_colour,
                                            borderColor: statusBorderColour,
                                            color: statusGlowColour,
                                        } as React.CSSProperties}
                                        className="
                                            absolute
                                            top-3
                                            right-3
                                            z-10
                                            border
                                            animate-tag-pulse
                                            animate-tag-text
                                        "
                                    />
                                )}                        
                            </div>                            
                        );
                    })()

                    
                    }
                </div>

                {/* Text Content */}
                <div className="
                    flex-1 
                    flex flex-col
                    min-w-70
                    justify-evenly
                    text-sm
                ">
                    <div className={props.condenseTech ? "line-clamp-3 overflow-hidden" : ""}>
                        <ReactMarkdown>{props.project.description}</ReactMarkdown>
                    </div>
                    <div>

                        <TechBadges
                            label="Languages"
                            items={languages}
                            condensed={props.condenseTech}
                            className="bg-gray-200 border border-gray-300"
                        />

                        <TechBadges
                            label="Libraries"
                            items={libraries}
                            condensed={props.condenseTech}
                            className="bg-gray-100 border border-gray-300"
                        />

                        <TechBadges
                            label="Tools"
                            items={tools}
                            condensed={props.condenseTech}
                            className="bg-gray-300 border border-gray-400"
                        />


                    </div>

                </div>

            </div>

            {props.project.link && (

                <div className="cursor-pointer ml-auto mt-4 w-fit"
                    onMouseEnter={() => {
                        props.onHoldCancel?.();
                        props.onButtonHoverStart?.();
                    }}
                    onMouseLeave={props.onButtonHoverEnd}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        window.open(
                            props.project.link,
                            "_blank",
                            "noopener,noreferrer"
                        );
                    }}
                    aria-label={
                        isGithub
                            ? `View ${props.project.name} source code`
                            : `Visit ${props.project.name} website`
                    }
                >
                    <Badge
                        style={{
                            "--glow": glowRGB,
                            "--project-colour": props.project.colour,
                            color: glowColour,
                            borderColor: borderColour,
                        } as React.CSSProperties}      
                        textSize="sm"
                        px={4}
                        py={2}
                        className="
                            group
                            gap-2!
                            bg-[color-mix(in_srgb,var(--project-colour)_25%,transparent)]
                            hover:bg-(--project-colour)
                            transition-all
                            duration-200
                            active:scale-95
                            hover:scale-105
                            border-2
                            animate-tag-pulse
                            animate-tag-text
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
                    </Badge>                              
                </div>
            
            )}
            
            {props.isLoggedIn && (
                <div
                    className="flex justify-between mt-4"
                    onMouseEnter={() => {
                        props.onHoldCancel?.();
                        props.onButtonHoverStart?.();
                    }}
                    onMouseLeave={() => {
                        props.onButtonHoverEnd?.();
                    }}
                    onTouchStart={() => {
                        props.onHoldCancel?.();
                        props.onButtonHoverStart?.();
                    }}
                    onTouchEnd={() => {
                        props.onButtonHoverEnd?.();
                    }}
                >
                    <EditButton action={props.onEdit!} />
                    <DeleteButton 
                        action={props.onDelete!}
                        itemName={props.project.name}
                    />
                </div>
            )}
        </a>
    );
}