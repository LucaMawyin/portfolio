import { getTechIcon } from "@/lib/techIcons";
import Badge from "./Badge";

export default function TechBadges({
    label,
    items,
    className,
    iconClassName = "",
    condensed = false,
}: {
    label: string;
    items: string[];
    className?: string;
    iconClassName?: string;
    condensed?: boolean;
}) {
    if (items.length === 0) return null;

    const visible = condensed ? items.slice(0, 2) : items;
    const remaining = items.slice(visible.length);

    const renderBadge = (item: string, key: string | number) => {
        const icon = getTechIcon(item);

        return (
            <Badge
                key={key}
                fontWeight="normal"
                borderRadius="lg"
                textSize="xs"
                shadow="sm"
                px={2}
                py={1}
                className={className}
                text={item}
            >
                {icon && (
                    <div
                        className={`
                            flex
                            items-center
                            justify-center
                            w-4
                            h-4
                            shrink-0
                            ${iconClassName}
                        `}
                    >
                            <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5 fill-current"
                                aria-hidden="true"
                            >
                                <path d={icon.path} />
                            </svg>
                    </div>                    
                )}

            </Badge>
        );
    };

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            <b className="flex my-auto">{label}:</b>

            {visible.map((item, i) => renderBadge(item, i))}

            {condensed && remaining.length > 0 && (
                remaining.length === 1
                    ? renderBadge(remaining[0], "remaining")
                    : (
                        <Badge
                            fontWeight="normal"
                            borderRadius="lg"
                            textSize="xs"
                            shadow="sm"
                            px={2}
                            py={1}
                            className={`gap-0! ${className}`}
                            text={`${remaining.length} others`}
                        >
                            <span className="flex w-4 h-4 justify-center items-center">+</span>
                        </Badge>
                    )
            )}
        </div>
    );
}