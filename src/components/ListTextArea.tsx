
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
    const pendingScroll = useRef<{ x: number; y: number } | null>(null);

    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = "0px";
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const scroll = pendingScroll.current;

        resizeTextarea(textarea);

        if (pendingCaret.current !== null) {
            const caret = Math.min(
                pendingCaret.current,
                textarea.value.length
            );

            textarea.setSelectionRange(caret, caret);
            pendingCaret.current = null;
        }

        if (scroll) {
            window.scrollTo(scroll.x, scroll.y);
            pendingScroll.current = null;
        }
    }, [value]);

    const handleChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const textarea = e.currentTarget;

        pendingScroll.current = {
            x: window.scrollX,
            y: window.scrollY,
        };

        pendingCaret.current = textarea.selectionStart;

        onValueChange(name, textarea.value);
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key !== "Enter" || e.nativeEvent.isComposing) return;

        e.preventDefault();

        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        pendingScroll.current = {
            x: window.scrollX,
            y: window.scrollY,
        };

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
                    overflowAnchor: "none",
                }}
            />
        </>
    );
}
