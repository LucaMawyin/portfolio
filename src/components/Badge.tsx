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

export default function Badge(props: {
    text?: string;
    className?: string;
    style?: React.CSSProperties;
    px?: number;
    py?: number;
    textSize?: keyof typeof textSizeClasses;
    fontWeight?: keyof typeof fontWeightClasses;
    borderRadius?: keyof typeof borderRadiusClasses;
    shadow?: keyof typeof shadowClasses;
    animateText?: boolean;
    children?: React.ReactNode;
}) {
    const px = props.px ?? 3;
    const py = props.py ?? 1;

    return (
        <div
            style={{
                paddingLeft: `${px * 0.25}rem`,
                paddingRight: `${px * 0.25}rem`,
                paddingTop: `${py * 0.25}rem`,
                paddingBottom: `${py * 0.25}rem`,
                gap: `${px * 0.25}rem`,
                ...props.style,
            }}
            className={`
                flex
                flex-row
                items-center
                text-center
                justify-center
                w-fit
                h-fit
                ${fontWeightClasses[props.fontWeight ?? "semibold"]}
                ${textSizeClasses[props.textSize ?? "xs"]}
                ${borderRadiusClasses[props.borderRadius ?? "full"]}
                ${shadowClasses[props.shadow ?? "md"]}
                ${props.className ?? ""}
            `}
        >
            {props.children}
            {props.text && (
                <span className={props.animateText ? "animate-tag-text" : ""}>
                    {props.text}
                </span>
            )}
        </div>
    );
}