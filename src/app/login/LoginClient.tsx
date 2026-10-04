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
    if (props.isLoggedIn){
        return (
            <div className="
                flex-1
                mt-[10vh]
                flex flex-col 
                gap-8 
                justify-center items-center"
            >
                <h1 className="text-[2em]! text-center">You are already logged in</h1>
                <Button 
                    text="Return to Home" 
                    onClick={() => {
                        router.push("/");
                    }}
                />
            </div>
        );
    }


    return (
        <div className="flex flex-1 justify-center items-center mt-[10vh]">
            <Tile 
                title="Login"
                disableHover={true}
                className="md:max-w-[30vw] max-w-full"
            >
                <form 
                    autoComplete="on"
                    onSubmit={handleSubmit}
                    className="
                        w-full
                        flex flex-col
                        justify-center
                        gap-3"
                >
                    {/* Email input */}
                    <label htmlFor="email">Enter Your Email:</label>
                    <input 
                        id="email" 
                        type="text" 
                        name="email" 
                        autoComplete="email" 
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {/* Password input */}
                    <label htmlFor="password">Enter Your Password:</label>
                    <div className="flex gap-2 w-full">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            autoComplete="current-password"
                            className="flex-1"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {/* Show/hide password button */}
                        <button
                            type="button"
                            className="flex-0 hover:cursor-pointer"
                            onClick={() => setShowPassword((p) => !p)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <Button 
                        text="Login" 
                        variant="secondary"
                        type="submit"
                        className="self-center"
                    />
                </form>
            </Tile>
        </div>
    );
}