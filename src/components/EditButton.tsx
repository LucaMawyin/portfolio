import Button from "./Button";
import { Pencil } from "lucide-react";

export default function EditButton({
    action,
    className = "",
    disabled = false,
    x,
    y,
}: {
    action: () => void;
    className?: string;
    disabled?: boolean;
    x?: number;
    y?: number;
}) {
    return (
        <Button
            type="button"
            disabled={disabled}
            className={className}
            onClick={(e) => {
                e.preventDefault();
                action();
            }}
            x={x}
            y={y}
        >
            <Pencil size={18} />
        </Button>
    );
}