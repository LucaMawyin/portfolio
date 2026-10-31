"use client";

import { AlertTriangle, Check, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export type NotificationStatus =
    | "success"
    | "error"
    | "info"
    | "warning";

export type Notification = {
    id: number;
    text: string;
    status: NotificationStatus;
};

type NotificationBubbleProps = {
    notification: Notification;
    onRemove: (id: number) => void;
    duration?: number;
};

export default function NotificationBubble({
    notification,
    onRemove,
    duration = 3000,
}: NotificationBubbleProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const enterTimer = requestAnimationFrame(() => {
            setVisible(true);
        });

        // Start exit animation shortly before removal
        const exitTimer = setTimeout(() => {
            setVisible(false);
        }, Math.max(0, duration - 300));

        // Remove after exit animation
        const removeTimer = setTimeout(() => {
            onRemove(notification.id);
        }, duration);

        return () => {
            cancelAnimationFrame(enterTimer);
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [duration, notification.id, onRemove]);

    const statusColours: Record<NotificationStatus, {
        background: string;
        border: string;
        text: string;
    }> = {
        success: {
            background: "0, 150, 55",
            border: "130, 255, 165",
            text: "#ffffff",
        },
        error: {
            background: "200, 15, 35",
            border: "255, 120, 135",
            text: "#ffffff",
        },
        info: {
            background: "15, 85, 210",
            border: "125, 180, 255",
            text: "#ffffff",
        },
        warning: {
            background: "200, 125, 0",
            border: "255, 215, 110",
            text: "#ffffff",
        },
    };

    const colours = statusColours[notification.status];

    const StatusIcon = {
        success: Check,
        error: X,
        info: Info,
        warning: AlertTriangle,
    }[notification.status];

    const iconColours = {
        success: "#30D158",
        error: "#FF453A",
        info: "#0A84FF",
        warning: "#FF9F0A",
    };

    return (
        <div
            style={{
                "--glass-colour": colours.background,
                "--glass-border-colour": colours.border,
                "--glass-opacity": "0.78",
                "--glass-border-opacity": "0.3",
                "--glass-shadow-opacity": "0.3",
                "--glass-highlight-opacity": "0.2",
                color: colours.text,
            } as React.CSSProperties}
            className={`
                w-[min(360px,calc(100vw-32px))]
                min-h-16
                px-4
                py-2
                text-sm
                font-medium
                whitespace-normal
                transition-all
                duration-300
                ease-out
                liquid-glass
                squircle-medium
                flex
                items-center
                gap-5
                ${
                    visible
                        ? "translate-y-0 opacity-100 scale-100"
                        : "translate-y-2 opacity-0 scale-95"
                }
            `}
        >

            <StatusIcon
                size={21}
                color="white"
                strokeWidth={2.5}
            />


            <span className="min-w-0 flex-1">
                {notification.text}
            </span>
        </div>
    );
}