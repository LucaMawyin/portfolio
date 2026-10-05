"use client";

const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
};

const fontWeightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
};

const borderRadiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    base: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
};

const shadowClasses = {
    none: "shadow-none",
    sm: "shadow-sm",
    base: "shadow",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
};

export default function Button(props: {
    text?: string;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "red" | "transparent";
    children?: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    name?: string;
    value?: string;
    x?: number;
    y?: number;
    textSize?: keyof typeof textSizeClasses;
    fontWeight?: keyof typeof fontWeightClasses;
    borderRadius?: keyof typeof borderRadiusClasses;
    shadow?: keyof typeof shadowClasses;
}) {
    function clickEvent(e: React.MouseEvent<HTMLButtonElement>) {
        props.onClick?.(e);
    }

    const base = `
        flex
        justify-center
        items-center
        text-center
        w-fit
        h-fit
        ${props.y ? "" : "py-4"}
        ${props.x ? "" : "px-8"}
        transition
        duration-(--transition-duration)
        cursor-pointer
        ${textSizeClasses[props.textSize ?? "base"]}
        ${fontWeightClasses[props.fontWeight ?? "medium"]}
        ${borderRadiusClasses[props.borderRadius ?? "xl"]}
        ${shadowClasses[props.shadow ?? "sm"]}
    `;

    const styles = {
        primary:
            "bg-white text-gray-950 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md",

        secondary:
            "bg-slate-800 text-white border border-slate-700 hover:bg-slate-900 hover:border-slate-800 hover:shadow-md",

        red:
            "bg-red-500 text-white border border-red-600 hover:bg-red-600 hover:border-red-700 hover:shadow-md",

        transparent:
            "bg-transparent text-gray-950 border border-transparent hover:bg-gray-100 hover:border-gray-200",
    };

    const disabledStyle = props.disabled
        ? "opacity-50 cursor-default!"
        : "";

    return (
        <button
            type={props.type ?? "button"}
            onClick={(e) => {
                e.stopPropagation();
                clickEvent(e);
            }}
            disabled={props.disabled}
            className={`
                ${base}
                ${styles[props.variant ?? "primary"]}
                ${props.className ?? ""}
                ${disabledStyle}
            `}
            name={props.name}
            value={props.value}
            style={{
                ...(props.y != null && {
                    paddingTop: `${props.y * 0.25}rem`,
                    paddingBottom: `${props.y * 0.25}rem`,
                }),
                ...(props.x != null && {
                    paddingRight: `${props.x * 0.25}rem`,
                    paddingLeft: `${props.x * 0.25}rem`,
                }),
            }}
        >

            {props.text}
            {props.children}

            
        </button>
    );
}