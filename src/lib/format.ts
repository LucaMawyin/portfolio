
export function normalizeList(value: string): string {
    return value
        .split(/[,\n]+/)
        .map((entry) =>
            entry.trim().replace(/^(?:•|-)\s*/, "").trim()
        )
        .filter(Boolean)
        .join(", ");
}

export function formatList(
    value: string | string[] | null | undefined
): string {
    if (!value) return "";

    let items: string[];

    if (Array.isArray(value)) {
        items = value;
    } else {
        const trimmed = value.trim();

        try {
            const parsed: unknown = JSON.parse(trimmed);

            if (Array.isArray(parsed)) {
                items = parsed.filter(
                    (item): item is string => typeof item === "string"
                );
            } else {
                items = trimmed.split(/[,\n]+/);
            }
        } catch {
            items = trimmed.split(/[,\n]+/);
        }
    }

    return items
        .map((item) =>
            item.trim().replace(/^(?:•|-)\s*/, "").trim()
        )
        .filter(Boolean)
        .map((item) => `• ${item}`)
        .join("\n");
}