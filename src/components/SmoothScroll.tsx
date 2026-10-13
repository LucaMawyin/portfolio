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
            autoRaf: true,
            duration: 1.2,
            smoothWheel: true,
        });

        lenisInstance = lenis;

        return () => {
            lenis.destroy();
            lenisInstance = null;
        };
    }, []);

    return null;
}