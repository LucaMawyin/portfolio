
import * as icons from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export function parseTechName(value: string): {
    name: string;
    iconOverride?: string;
} {
    const [name, ...params] = value.split("&");

    const iconParam = params.find((param) =>
        param.startsWith("icon=")
    );

    return {
        name: name.trim(),
        iconOverride: iconParam
            ? decodeURIComponent(iconParam.slice("icon=".length))
            : undefined,
    };
}

export function getTechIcon(value: string): SimpleIcon | undefined {
    const { name, iconOverride } = parseTechName(value);
    const normalized = (iconOverride || name).toLowerCase().trim();

    return Object.values(icons).find((icon) => {
        if (!icon || typeof icon !== "object" || !("title" in icon)) {
            return false;
        }

        const simpleIcon = icon as SimpleIcon;

        return (
            simpleIcon.title.toLowerCase() === normalized ||
            simpleIcon.slug.toLowerCase() === normalized
        );
    }) as SimpleIcon | undefined;
}