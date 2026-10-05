"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginResponse } from "@/lib/types";
import Button from "@/components/Button";
import { isSafeNext } from "@/lib/nextPath";
import { useNotifications } from "@/components/NotificationProvider";

export default function VerifyLoginClient(props : {type : string}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { notify } = useNotifications();

    const email = searchParams.get("email") || "";
    const next = searchParams.get("next") || "/";

    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const fullCode = code.join("");

    const [loading, setLoading] = useState(false);

    async function handleSubmit(e : React.FormEvent){
        e.preventDefault();
        await verifyCode();
    }

    function handleChange(value: string, index: number) {
        if (!/^\d?$/.test(value)) return; // only 0–9

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // auto move to next input
        if (value && index < 5) {
            const next = document.getElementById(`otp-${index + 1}`);
            next?.focus();
        }
    }

    function handleKeyDown(e: React.KeyboardEvent, index: number) {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const prev = document.getElementById(`otp-${index - 1}`);
            prev?.focus();
        }
    }

    async function verifyCode() {
        setLoading(true);

        try {

            if (fullCode.length !== 6) {
                notify("Enter the full 6-digit code","error");
                return;
            }

            const serial = searchParams.get("serial");

            const res = await fetch("/api/verify-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    email, 
                    code: fullCode,
                    serial: props.type === "unlock" ? serial : undefined,
                }),
            });

            const data = await res.json() as LoginResponse;

            if (!res.ok) {
                notify(data.error || "Invalid code", "error");
                return;
            }

            const safeNext = isSafeNext(next) ? next : "/";
            
            router.push(safeNext);
            router.refresh();                

        } catch {
            notify("Server error", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const isComplete = code.every(d => d !== "");
        if (isComplete && !loading) {
            verifyCode();
        }
    }, [code]);

    return (
        <div className="flex flex-1 justify-center items-center mt-[10vh]">
            <form
                onSubmit={handleSubmit}
                className="
                    flex
                    flex-col
                    gap-4
                    text-center
                    w-full
                    max-w-lg
                    px-6
                    py-8
                    mx-4
                    pillow
                    squircle-large
                "
            >
                
                <h2 className="text-3xl font-bold">
                    Enter verification code
                </h2>

                <p className="text-sm text-gray-500">
                    Check your email for the 6-digit verification code.
                </p>

                <div className="flex gap-2 justify-center">
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            id={`otp-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className="w-10 h-12 text-center text-lg"
                        />
                    ))}
                </div>

                <Button 
                    text={loading ? "Verifying..." : "Verify"} 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                    className="self-center"
                    x={8}
                    y={3}
                />
            </form>
        </div>
    );
}