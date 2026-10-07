type SwitchProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    name?: string;
};

export default function Switch({
    checked,
    onChange,
    name,
}: SwitchProps) {
    return (
        <label className="relative inline-flex cursor-pointer">
            <input
                name={name}
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />

            <span
                className="
                    w-10 h-6
                    rounded-full
                    bg-(--input-colour)
                    transition-colors
                    peer-checked:bg-(--contrast-light)
                "
            />

            <span
                className="
                    absolute
                    top-1 left-1
                    w-4 h-4
                    rounded-full
                    bg-(--primary-colour)
                    shadow
                    transition-transform
                    peer-checked:translate-x-4
                "
            />
        </label>
    );
}