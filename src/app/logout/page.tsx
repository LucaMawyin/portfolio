"use client";

import { useNotifications } from "@/components/NotificationProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
    const router = useRouter();
    const { notify } = useNotifications();

    useEffect(() => {
        async function logout() {
            await fetch("/api/logout", {
                method: "POST",
            });

            router.replace("/");
            router.refresh();

            notify("Logged out successfully", "success");
        }

        logout();
    }, [router, notify]);

    return (
        <main className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-semibold tracking-widest uppercase opacity-60">
                LOGGED OUT
            </p>

            <h2 className="mt-4 text-4xl md:text-6xl font-bold">
                Successfully Logged Out
            </h2>

            <p className="mt-4 max-w-md text-gray-500">
                You have been securely logged out of your account. Redirecting
                you back home...
            </p>

            <a
                href="/"
                className="
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
            </a>
        </main>
    );
}