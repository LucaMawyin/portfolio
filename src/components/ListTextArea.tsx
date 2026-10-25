"use client";

import { useRef, useLayoutEffect } from "react";
import { capitalizeNamesAndTitles } from "@/lib/capitalizeNamesAndTitles";

type ListTextareaProps = {
    id: string;
    name: string;
    value: string;
    placeholder: string;
    onValueChange: (name: string, value: string) => void;
};

export default function ListTextarea({
    id,
    name,
    value,
    placeholder,
    onValueChange,
}: ListTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pendingCaret = useRef<number | null>(null);

    const resizeTextarea = (
        textarea: HTMLTextAreaElement,
        scrollY: number
    ) => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;

        window.scrollTo({
            top: scrollY,
            behavior: "instant",
        });
    };

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const scrollY = window.scrollY;

        resizeTextarea(textarea, scrollY);

        if (pendingCaret.current !== null) {
            const caret = Math.min(
                pendingCaret.current,
                textarea.value.length
            );

            textarea.setSelectionRange(caret, caret);
            pendingCaret.current = null;
        }
    }, [value]);

    const normalizeBullets = (text: string) => {
        return text
            .split(/[\n,]+/)
            .map((entry) =>
                entry.trim().replace(/^(?:•|-)\s*/, "")
            )
            .filter(Boolean)
            .map((entry) => `• ${capitalizeNamesAndTitles(entry)}`)
            .join("\n");
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const textarea = e.currentTarget;
        const scrollY = window.scrollY;
        const rawValue = textarea.value;

        const endsWithSeparator = /[,\n]\s*$/.test(rawValue);
        const normalized = normalizeBullets(rawValue);

        const updatedValue =
            endsWithSeparator && normalized
                ? `${normalized}\n• `
                : normalized;

        pendingCaret.current = updatedValue.length;

        resizeTextarea(textarea, scrollY);
        onValueChange(name, updatedValue);
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key !== "Enter" && e.key !== ",") return;
        if (e.nativeEvent.isComposing) return;

        e.preventDefault();

        const textarea = e.currentTarget;
        const scrollY = window.scrollY;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const before = value.slice(0, start);
        const after = value.slice(end);

        const currentEntry = before.split(/[\n,]/).pop() ?? "";

        const formattedEntry = capitalizeNamesAndTitles(
            currentEntry.trim().replace(/^(?:•|-)\s*/, "")
        );

        const prefix = before.slice(
            0,
            before.length - currentEntry.length
        );

        const separator = "\n• ";

        const updatedValue =
            prefix +
            `• ${formattedEntry}` +
            separator +
            after.replace(/^[ \t]*/, "").replace(/^(?:•|-)\s*/, "");

        pendingCaret.current =
            prefix.length + formattedEntry.length + separator.length + 2;

        resizeTextarea(textarea, scrollY);
        onValueChange(name, updatedValue);
    };

    return (
        <>
            <label htmlFor={id}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
            </label>

            <textarea
                ref={textareaRef}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                rows={1}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                style={{
                    overflow: "hidden",
                    resize: "none",
                    overflowWrap: "normal",
                    wordBreak: "normal",
                    boxSizing: "border-box",
                    whiteSpace: "pre-wrap",
                }}
            />
        </>
    );
}