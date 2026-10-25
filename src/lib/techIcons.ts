
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
