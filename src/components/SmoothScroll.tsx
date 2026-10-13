"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function getLenis() {
    return lenisInstance;
}

export default function SmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) =>
                Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        lenisInstance = lenis;

        let animationFrame: number;

        function raf(time: number) {
            lenis.raf(time);
            animationFrame = requestAnimationFrame(raf);
        }

        animationFrame = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(animationFrame);
            lenis.destroy();
            lenisInstance = null;
        };
    }, []);

    return null;
}