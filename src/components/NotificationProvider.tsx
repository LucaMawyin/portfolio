"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";

import NotificationBubble, {
    Notification,
    NotificationStatus,
} from "./NotificationBubble";

type NotificationContextType = {
    notify: (
        text: string,
        status?: NotificationStatus
    ) => void;
};

const NotificationContext =
    createContext<NotificationContextType | null>(null);

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = useCallback(
        (
            text: string,
            status: NotificationStatus = "info"
        ) => {
            const notification: Notification = {
                id: Date.now() + Math.random(),
                text,
                status,
            };

            setNotifications((prev) => [
                ...prev,
                notification,
            ].slice(-5));
        },
        []
    );

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) =>
            prev.filter(
                (notification) => notification.id !== id
            )
        );
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}

            <div
                className="
                    fixed
                    bottom-22.5
                    lg:bottom-8
                    left-1/2
                    -translate-x-1/2
                    z-50
                    flex
                    flex-col
                    items-center
                    gap-2
                    pointer-events-none
                    max-w-[calc(100vw-2rem)]
                "
            >
                {notifications.map((notification) => (
                    <NotificationBubble
                        key={notification.id}
                        notification={notification}
                        onRemove={removeNotification}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );
    }

    return context;
}
