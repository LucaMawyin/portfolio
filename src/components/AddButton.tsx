import Button from "./Button";
import { Plus } from "lucide-react";

export default function AddButton({
    action,
    className = "",
    disabled = false,
    text,
    x,
    y,
}: {
    action: () => void;
    className?: string;
    disabled?: boolean;
    text?: string;
    x?: number;
    y?: number;
}) {
    return (
        <Button
            type="button"
            disabled={disabled}
            className={`flex flex-row-reverse gap-4 ${className}`}
            onClick={action}
            x={x}
            y={y}
            text={text}
        >
            <Plus size={18} />
        </Button>
    );
}