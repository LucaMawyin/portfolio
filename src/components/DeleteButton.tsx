"use client";

import Button from "@/components/Button";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { getLenis } from "./SmoothScroll";
import { Trash2 } from "lucide-react";

export default function DeleteButton({
    action,
    className = "",
    disabled = false,
    buttonText = "",
    itemName = "",
    actionName = "",
    x,
    y,
}: {
    action: () => void;
    className?: string;
    disabled?: boolean;
    buttonText?: string;
    actionName?: string;
    itemName?:string;
    text?: string;
    customText?: string;
    customDescription?: string;
    x?: number;
    y?: number;
}) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            await action();
        });
    };

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
            getLenis()?.stop();
        } else {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            getLenis()?.start();
        }

        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            getLenis()?.start();
        };
    }, [open]);

    return (
        <>
            <Button
                type="button"
                variant="red"
                text={buttonText}
                disabled={disabled}
                className={`flex flex-row-reverse ${
                    buttonText ? "gap-4" : ""
                } ${className}`}
                onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                }}
                x={x}
                y={y}
            >
                <Trash2 size={18} />
            </Button>

            {open &&
                createPortal(
                    <div
                        className="
                            fixed inset-0
                            z-10000
                            flex items-center justify-center
                            bg-black/50
                            backdrop-blur-
                            p-4
                            touch-none
                        "
                        onClick={() => {
                            if (!isPending) setOpen(false);
                        }}
                    >
                        <div
                            className="
                                w-full
                                max-w-md
                                p-8
                                shadow-2xl
                                pillow
                                squircle-large
                            "
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className="flex justify-center">
                                <div
                                    className="
                                        flex
                                        h-16
                                        w-16
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-red-100
                                        text-red-600
                                    "
                                >
                                    <Trash2 size={28} />
                                </div>
                            </div>

                            {/* Title */}
                            <h2
                                className="
                                    mt-7
                                    text-center
                                    text-[2em]
                                    font-semibold
                                    leading-tight
                                    text-gray-950
                                    wrap-break-word
                                "
                            >
                                {actionName || "Delete"}{itemName ? " " + itemName : ""}?
                            </h2>

                            {/* Description */}
                            <div className="mt-4 space-y-2 text-center">
                                <p className="text-sm leading-6 text-gray-600">
                                    Are you sure you want to {actionName ? actionName.toLowerCase() : "delete"}{itemName ? `${" " + itemName.toLowerCase()}` : ""}?
                                </p>

                                <p className="text-sm leading-6 text-gray-500">
                                    This action is permanent and cannot be undone.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="mt-9 flex justify-between gap-4">
                                <Button
                                    text="Cancel"
                                    variant="primary"
                                    x={4}
                                    y={2}
                                    onClick={() => setOpen(false)}
                                    disabled={isPending}
                                />

                                <Button
                                    text={actionName || "Delete"}
                                    variant="red"
                                    x={6}
                                    y={2}
                                    onClick={() => {
                                        setOpen(false);
                                        handleDelete();
                                    }}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}