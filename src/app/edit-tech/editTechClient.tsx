"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { useNotifications } from "@/components/NotificationProvider";
import Tile from "@/components/Tile";
import { capitalizeNamesAndTitles } from "@/lib/capitalizeNamesAndTitles";
import { LoginResponse, Tech } from "@/lib/types";
import { useRouter } from "next/navigation";
import Badge from "@/components/Badge";

export default function EditTechClient(props: {
    tech: Tech[];
    referrer?: string | null;
}) {
    const router = useRouter();
    const { notify } = useNotifications();

    const grouped = props.tech.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item.name);
        return acc;
    }, {} as Record<string, string[]>);

    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        languages: grouped.languages?.join(", ") ?? "",
        libraries: grouped.libraries?.join(", ") ?? "",
        tools: grouped.tools?.join(", ") ?? "",
    });

    const [nextPage] = useState<string | null>(() => {
        if (typeof window === "undefined") {
            return props.referrer ?? null;
        }

        return (
            sessionStorage.getItem("nextPage") ??
            props.referrer ??
            null
        );
    });

    const steps = [
        "Languages",
        "Libraries",
        "Tools",
        "Review",
    ];

    useEffect(() => {
        requestAnimationFrame(() => {
            const textareas = document.querySelectorAll("textarea");

            textareas.forEach((textarea) => {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            });
        });
    }, [form, step]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        const shouldCapitalize =
            name === "tools" ||
            name === "languages" ||
            name === "libraries";

        const formattedValue = shouldCapitalize
            ? capitalizeNamesAndTitles(
                value.replace(/\s*,\s*/g, ", ")
            )
            : value;

        setForm((prev) => ({
            ...prev,
            [name]: formattedValue,
        }));
    };

    const validateStep = (stepToValidate: number) => {
        switch (stepToValidate) {
            case 1:
                return true;

            case 2:
                return true;

            case 3:
                return true;

            default:
                return true;
        }
    };

    const goToStep = (targetStep: number) => {
        if (targetStep < step) {
            setStep(targetStep);
            return;
        }

        if (targetStep === step) {
            return;
        }

        for (
            let currentStep = step;
            currentStep < targetStep;
            currentStep++
        ) {
            if (!validateStep(currentStep)) {
                return;
            }
        }

        setStep(targetStep);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/tech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            notify("Tech updated successfully", "success");

            router.refresh();
            router.push(nextPage ?? "/tech");
        } else if (res.status === 401) {
            router.push("/login");
        } else {
            const data = await res.json() as LoginResponse;

            notify(
                data.error || "Tech update failed",
                "error"
            );
        }
    };

    return (
        <div className="flex justify-center min-h-[90vh]">
            <form
                className="
                    flex
                    flex-col
                    w-full
                    h-full
                    min-h-[80vh]
                    max-w-3xl
                    mt-[10vh]
                    [&_div]:mt-4
                "
                onSubmit={handleSubmit}
            >
                {/* PROGRESS */}
                <div className="flex flex-col items-center w-full mt-0!">
                    <div className="flex items-center justify-center w-full">
                        {steps.map((label, index) => {
                            const item = index + 1;

                            return (
                                <div
                                    key={item}
                                    className="flex items-center mt-0!"
                                >
                                    <button
                                        type="button"
                                        onClick={() => goToStep(item)}
                                        disabled={item > step + 1}
                                        aria-label={`Go to ${label}`}
                                        className={`
                                            relative
                                            flex
                                            items-center
                                            justify-center
                                            w-8
                                            h-8
                                            rounded-full
                                            text-xs
                                            font-medium
                                            transition-all
                                            duration-300
                                            ${
                                                item === step
                                                    ? `
                                                        scale-110
                                                        bg-black
                                                        text-white
                                                        shadow-md
                                                        ring-4
                                                        ring-black/10
                                                    `
                                                    : item < step
                                                        ? `
                                                            bg-black
                                                            text-white
                                                            cursor-pointer
                                                            hover:scale-105
                                                        `
                                                        : item === step + 1
                                                            ? `
                                                                bg-black/5
                                                                text-black/50
                                                                cursor-pointer
                                                                hover:bg-black/10
                                                            `
                                                            : `
                                                                bg-black/5
                                                                text-black/40
                                                                cursor-default
                                                            `
                                            }
                                        `}
                                    >
                                        {item < step ? "✓" : item}
                                    </button>

                                    {index < steps.length - 1 && (
                                        <div
                                            className={`
                                                mt-0!
                                                h-px
                                                w-6
                                                sm:w-14
                                                mx-2
                                                transition-all
                                                duration-500
                                                ${
                                                    item < step
                                                        ? "bg-black"
                                                        : "bg-black/10"
                                                }
                                            `}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-3 text-sm font-medium">
                        {steps[step - 1]}
                    </div>
                </div>

                <div className="my-auto!">
                    {/* FORM */}
                    <div className="relative w-full mt-0! px-2">
                        <div
                            key={step}
                            className="
                                animate-step-in
                                w-full
                            "
                        >
                            {/* STEP 1 — LANGUAGES */}
                            {step === 1 && (
                                <Tile
                                    title={steps[step - 1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                >
                                    <label htmlFor="languages">
                                        Languages
                                    </label>

                                    <textarea
                                        id="languages"
                                        name="languages"
                                        placeholder="Languages (comma separated)"
                                        value={form.languages}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                            overflowWrap: "normal",
                                            wordBreak: "normal",
                                        }}
                                        onChange={handleChange}
                                    />
                                </Tile>
                            )}

                            {/* STEP 2 — LIBRARIES */}
                            {step === 2 && (
                                <Tile
                                    title={steps[step - 1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                >
                                    <label htmlFor="libraries">
                                        Libraries
                                    </label>

                                    <textarea
                                        id="libraries"
                                        name="libraries"
                                        placeholder="Libraries (comma separated)"
                                        value={form.libraries}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                            overflowWrap: "normal",
                                            wordBreak: "normal",
                                        }}
                                        onChange={handleChange}
                                    />
                                </Tile>
                            )}

                            {/* STEP 3 — TOOLS */}
                            {step === 3 && (
                                <Tile
                                    title={steps[step - 1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                >
                                    <label htmlFor="tools">
                                        Tools
                                    </label>

                                    <textarea
                                        id="tools"
                                        name="tools"
                                        placeholder="Tools (comma separated)"
                                        value={form.tools}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                            overflowWrap: "normal",
                                            wordBreak: "normal",
                                        }}
                                        onChange={handleChange}
                                    />
                                </Tile>
                            )}

                            {/* STEP 4 — REVIEW */}
                            {step === 4 && (
                                <Tile
                                    title={steps[step - 1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                    childClassName="[&_div]:mt-0!"
                                >
                                    {/* LANGUAGES */}
                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-2
                                            p-4
                                            rounded-xl
                                            transition-colors
                                            duration-100
                                            hover:bg-gray-200
                                            hover:cursor-pointer
                                        "
                                        onClick={() => goToStep(1)}
                                    >
                                        <h2 className="text-[2rem] font-semibold text-center">
                                            {steps[0]}
                                        </h2>

                                        {form.languages && (
                                            <div className="flex flex-wrap gap-2">
                                                {form.languages
                                                    .split(",")
                                                    .map(
                                                        (
                                                            language: string,
                                                            index: number
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                fontWeight="normal"
                                                                borderRadius="lg"
                                                                textSize="xs"
                                                                shadow="sm"
                                                                px={2}
                                                                py={1}
                                                                className="
                                                                    bg-gray-200
                                                                    border
                                                                    border-gray-300
                                                                "
                                                                text={language.trim()}
                                                            />
                                                        )
                                                    )}
                                            </div>
                                        )}
                                    </div>

                                    {/* LIBRARIES */}
                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-2
                                            p-4
                                            rounded-xl
                                            transition-colors
                                            duration-100
                                            hover:bg-gray-200
                                            hover:cursor-pointer
                                        "
                                        onClick={() => goToStep(2)}
                                    >
                                        <h2 className="text-[2rem] font-semibold text-center">
                                            {steps[1]}
                                        </h2>

                                        {form.libraries && (
                                            <div className="flex flex-wrap gap-2">
                                                {form.libraries
                                                    .split(",")
                                                    .map(
                                                        (
                                                            library: string,
                                                            index: number
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                fontWeight="normal"
                                                                borderRadius="lg"
                                                                textSize="xs"
                                                                shadow="sm"
                                                                px={2}
                                                                py={1}
                                                                className="
                                                                    bg-gray-100
                                                                    border
                                                                    border-gray-300
                                                                "
                                                                text={library.trim()}
                                                            />
                                                        )
                                                    )}
                                            </div>
                                        )}
                                    </div>

                                    {/* TOOLS */}
                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-2
                                            p-4
                                            rounded-xl
                                            transition-colors
                                            duration-100
                                            hover:bg-gray-200
                                            hover:cursor-pointer
                                        "
                                        onClick={() => goToStep(3)}
                                    >
                                        <h2 className="text-[2rem] font-semibold text-center">
                                            {steps[2]}
                                        </h2>

                                        {form.tools && (
                                            <div className="flex flex-wrap gap-2">
                                                {form.tools
                                                    .split(",")
                                                    .map(
                                                        (
                                                            tool: string,
                                                            index: number
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                fontWeight="normal"
                                                                borderRadius="lg"
                                                                textSize="xs"
                                                                shadow="sm"
                                                                px={2}
                                                                py={1}
                                                                className="
                                                                    bg-gray-300
                                                                    border
                                                                    border-gray-400
                                                                "
                                                                text={tool.trim()}
                                                            />
                                                        )
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                </Tile>
                            )}
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div
                        className="
                            flex
                            w-full
                            justify-between
                            px-4
                        "
                    >
                        <Button
                            text="Back"
                            variant="secondary"
                            onClick={() => {
                                if (step !== 1) {
                                    setStep(step - 1);
                                } else {
                                    router.refresh();
                                    router.push(
                                        nextPage ?? "/tech"
                                    );
                                }
                            }}
                        />

                        {step !== 4 && (
                            <Button
                                text="Next"
                                onClick={() =>
                                    goToStep(step + 1)
                                }
                            />
                        )}

                        {step === 4 && (
                            <Button
                                text="Post"
                                type="submit"
                                name="mode"
                            />
                        )}
                    </div>                    
                </div>


            </form>
        </div>
    );
}