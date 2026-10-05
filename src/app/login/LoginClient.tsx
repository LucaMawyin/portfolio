"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/Button";
import Tile from "@/components/Tile";
import { LoginResponse } from "@/lib/types";
import { useNotifications } from "@/components/NotificationProvider";

export default function Login(props : {isLoggedIn : boolean}){

    // Email, password and error states
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorKey, setErrorKey] = useState(0);
    const { notify } = useNotifications();
    function showError(message: string) {
        
        notify(message, "error");
        setErrorKey(prev => prev + 1);
    }

    // Login form submission
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") || "/";

    async function handleSubmit(e : React.FormEvent){

        e.preventDefault();

        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email,password}),
        });

        let data : LoginResponse;

        try {
            data = await response.json();
        } catch {
            notify("Server error", "error");
            return;
        }

        // Login error response
        if (!response.ok) {
            notify(data.error || "Login failed", "error");
            return;
        }


        // Push to verification page
        if (data.status === "verification_required") {

            router.push(
                `/verify-login?attempt=${data.attemptId}&next=${encodeURIComponent(next)}`
            );
            return;
        } 
    }

    // Show message if user is already logged in
    if (props.isLoggedIn) {
        return (
            <div className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
                <h2 className="text-4xl md:text-6xl font-bold">
                    You are already logged in
                </h2>

                <p className="mt-4 max-w-md text-gray-500">
                    You are already signed in to your account. There&apos;s no need
                    to log in again.
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
                    Return to Home
                </a>
            </div>
        );
    }


    return (
        <div className="min-h-[90vh] flex items-center justify-center px-6">
            <div
                className="
                    w-full
                    max-w-md
                    p-8
                    md:p-10
                    rounded-3xl
                    pillow
                    squircle-large
                "
            >
                <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-bold">
                        Login
                    </h2>

                    <p className="mt-3 text-gray-500">
                        Sign in to continue to your account.
                    </p>
                </div>

                <form
                    autoComplete="on"
                    onSubmit={handleSubmit}
                    className="
                        w-full
                        flex
                        flex-col
                        gap-4
                        mt-8
                    "
                >
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email">
                            Enter Your Email:
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full min-w-0"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password">
                            Enter Your Password:
                        </label>

                        <div className="flex gap-2 w-full min-w-0">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="current-password"
                                className="flex-1 min-w-0"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                className="
                                    shrink-0
                                    px-2
                                    font-medium
                                    text-gray-600
                                    hover:text-gray-950
                                    cursor-pointer
                                "
                                onClick={() => setShowPassword((p) => !p)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <Button
                        text="Login"
                        variant="primary"
                        type="submit"
                        className="self-center"
                        x={8}
                        y={3}
                    />
                </form>
            </div>
        </div>
    );
}