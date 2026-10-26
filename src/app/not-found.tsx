"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {

    const router = useRouter();

    return (
        <main className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-semibold tracking-widest uppercase opacity-60">
                404
            </p>

            <h1 className="mt-4 text-4xl md:text-6xl font-bold">
                Page not found
            </h1>

            <p className="mt-4 max-w-md text-gray-500">
                The page you're looking for doesn't exist or may have been moved.
            </p>

            <div
                onClick={() => router.push("/")}
                className="
                    cursor-pointer
                    mt-8
                    px-5
                    py-2.5
                    rounded-full
                    border
                    border-gray-300
                    bg-gray-100
                    font-semibold
                    transition-all
                    duration-200
                    hover:scale-105
                    hover:bg-gray-200
                    active:scale-95
                "
            >
                Back Home
            </div>
        </main>
    );
}