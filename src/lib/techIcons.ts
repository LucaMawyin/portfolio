
import * as icons from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export function parseTechName(value: string): {
    name: string;
    iconOverride?: string;
} {
    const [name, iconOverride] = value.split(/&icon=/, 2);

    return {
        name: name.trim(),
        iconOverride: iconOverride
            ? decodeURIComponent(iconOverride)
            : undefined,
    };
}

const iconMap = new Map<string, SimpleIcon>();

for (const icon of Object.values(icons)) {
    if (
        !icon ||
        typeof icon !== "object" ||
        !("title" in icon) ||
        !("slug" in icon)
    ) {
        continue;
    }

    const simpleIcon = icon as SimpleIcon;

    iconMap.set(simpleIcon.title.toLowerCase(), simpleIcon);
    iconMap.set(simpleIcon.slug.toLowerCase(), simpleIcon);
}

export function getTechIcon(value: string): SimpleIcon | undefined {
    const { name, iconOverride } = parseTechName(value);
    const normalized = (iconOverride || name).toLowerCase().trim();

    return iconMap.get(normalized);
}
