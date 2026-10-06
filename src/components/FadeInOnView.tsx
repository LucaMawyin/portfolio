"use client";

import { useEffect, useRef, useState } from "react";

export default function FadeInOnView({
    children,
    className = "",
    style,
    delay = 0,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    delay?: number;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onTouchStart?: () => void;
    onTouchEnd?: () => void;
    onTouchCancel?: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    const classNames = className.split(/\s+/);

    const baseDirection =
        classNames.includes("fade-right")
            ? "right"
            : classNames.includes("fade-left")
                ? "left"
                : "up";

    const smDirection =
        classNames.includes("sm:fade-right")
            ? "right"
            : classNames.includes("sm:fade-left")
                ? "left"
                : classNames.includes("sm:fade-up")
                    ? "up"
                    : null;

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setVisible(entry.isIntersecting);
            },
            {
                threshold: 0,
                rootMargin: "0px 0px -15% 0px",
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    let animationClasses: string;

    if (visible) {
        animationClasses =
            "opacity-100 translate-x-0 translate-y-0";
    } else if (smDirection === "up") {
        animationClasses =
            baseDirection === "right"
                ? "opacity-[0.01] translate-x-8 sm:translate-x-0 sm:translate-y-4"
                : baseDirection === "left"
                    ? "opacity-[0.01] -translate-x-8 sm:translate-x-0 sm:translate-y-4"
                    : "opacity-[0.01] translate-y-4";
    } else if (smDirection === "right") {
        animationClasses =
            baseDirection === "up"
                ? "opacity-[0.01] translate-y-4 sm:translate-y-0 sm:translate-x-8"
                : baseDirection === "left"
                    ? "opacity-[0.01] -translate-x-8 sm:translate-x-8"
                    : "opacity-[0.01] translate-x-8";
    } else if (smDirection === "left") {
        animationClasses =
            baseDirection === "up"
                ? "opacity-[0.01] translate-y-4 sm:translate-y-0 sm:-translate-x-8"
                : baseDirection === "right"
                    ? "opacity-[0.01] translate-x-8 sm:-translate-x-8"
                    : "opacity-[0.01] -translate-x-8";
    } else {
        animationClasses =
            baseDirection === "right"
                ? "opacity-[0.01] translate-x-8"
                : baseDirection === "left"
                    ? "opacity-[0.01] -translate-x-8"
                    : "opacity-[0.01] translate-y-4";
    }

    return (
        <div
            ref={ref}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchCancel}
            style={{
                ...style,
                transitionDelay:
                    style?.transitionDelay ??
                    `${delay}ms`,
            }}
            className={`
                relative
                transition-all
                duration-700
                ease-out
                ${animationClasses}
                ${className}
            `}
        >
            {children}
        </div>
    );
}