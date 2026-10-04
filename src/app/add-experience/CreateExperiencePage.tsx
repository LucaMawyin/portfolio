"use client";

import { useEffect, useRef, useState } from "react";
import Tile from "@/components/Tile";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { LoginResponse, Tag } from "@/lib/types";
import { capitalizeNamesAndTitles } from "@/lib/capitalizeNamesAndTitles";
import { ensurePunctuation } from "@/lib/ensurePunctuation";
import DeleteButton from "@/components/DeleteButton";
import { useNotifications } from "@/components/NotificationProvider";
import Badge from "@/components/Badge";
import ReactMarkdown from "react-markdown";

export default function CreateExperiencePage(props: {
    initialData?: any;
    tags: Tag[];
    referrer?: string | null;
}) {
    const router = useRouter();
    const { notify } = useNotifications();

    const safeString = (v: any) => (v ?? "").toString();

    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        title: safeString(props.initialData?.title),
        description: safeString(props.initialData?.description),
        company: safeString(props.initialData?.company),
        city: safeString(props.initialData?.city),
        region: safeString(props.initialData?.region),
        tag: safeString(props.initialData?.tag),
        start_date: safeString(props.initialData?.start_date),
        end_date: safeString(props.initialData?.end_date),
    });

    const [customTag, setCustomTag] = useState("");
    const [useCustomTag, setUseCustomTag] = useState(false);

    const [nextPage] = useState<string | null>(() => {
        if (typeof window === "undefined") {
            return props.referrer ?? null;
        }

        return (
            sessionStorage.getItem("nextPage") ??
            props.referrer ??
            null
        );
    });

    const currentDate = new Date();
    const currentYear = String(currentDate.getFullYear());
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

    const startDate =
        form.start_date || `${currentYear}${currentMonth}`;

    const startYear =
        startDate.length >= 4
            ? startDate.slice(0, 4)
            : currentYear;

    const startMonth =
        startDate.length >= 6
            ? startDate.slice(4, 6)
            : "01";

    const endDate = form.end_date || "";

    const endYear =
        endDate.length >= 4
            ? endDate.slice(0, 4)
            : "";

    const endMonth =
        endDate.length >= 6
            ? endDate.slice(4, 6)
            : "01";

    const steps = [
        "Overview",
        "Details",
        "Review",
    ];

    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        requestAnimationFrame(() => {
            const textareas = document.querySelectorAll("textarea");

            textareas.forEach((textarea) => {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            });
        });
    }, [form, step]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        const shouldCapitalize =
            name === "title" ||
            name === "company" ||
            name === "region" ||
            name === "city";

        const formattedValue = shouldCapitalize
            ? capitalizeNamesAndTitles(value)
            : value;

        setForm((prev) => ({
            ...prev,
            [name]: formattedValue,
        }));
    };

    const validateStep = (stepToValidate: number) => {
        switch (stepToValidate) {
            case 1:
                if (!form.title.trim()) {
                    notify("Please enter an experience title", "error");
                    return false;
                }

                if (!form.company.trim()) {
                    notify("Please enter a company", "error");
                    return false;
                }

                if (!form.description.trim()) {
                    notify(
                        "Please enter an experience description",
                        "error"
                    );
                    return false;
                }

                return true;

            case 2:
                return true;

            default:
                return true;
        }
    };

    const goToStep = (targetStep: number) => {
        if (targetStep < step) {
            setStep(targetStep);
            return;
        }

        if (targetStep === step) {
            return;
        }

        for (
            let currentStep = step;
            currentStep < targetStep;
            currentStep++
        ) {
            if (!validateStep(currentStep)) {
                return;
            }
        }

        setStep(targetStep);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(1)) return;

        const formData = new FormData();

        if (props.initialData?.id) {
            formData.append("id", props.initialData.id);
        }

        const start_date =
            form.start_date &&
            form.start_date.length === 6
                ? form.start_date
                : `${startYear}${startMonth}`;

        const end_date =
            form.end_date &&
            form.end_date.length === 6
                ? form.end_date
                : "";

        formData.append("title", form.title);
        formData.append("company", form.company);
        formData.append("description", form.description);
        formData.append("tag", form.tag);
        formData.append("city", form.city);
        formData.append("region", form.region);
        formData.append("start_date", start_date);
        formData.append("end_date", end_date);

        const res = await fetch("/api/experience", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            if (props.initialData?.id) {
                notify(
                    "Experience updated successfully",
                    "success"
                );
            } else {
                notify(
                    "Experience uploaded successfully",
                    "success"
                );
            }

            router.refresh();
            router.push(nextPage ?? "/experience");
        } else if (res.status === 401) {
            router.push("/login");
        } else {
            const data = await res.json() as LoginResponse;

            notify(
                data.error || "Experience upload failed",
                "error"
            );
        }
    };

    return (
        <div className="flex justify-center min-h-[90vh]">
            <form
                className="
                    flex
                    flex-col
                    w-full
                    h-full
                    min-h-[80vh]
                    max-w-3xl
                    mt-[10vh]
                    [&_div]:mt-4
                "
                onSubmit={handleSubmit}
            >
                {/* PROGRESS */}
                <div className="flex flex-col items-center w-full mt-0!">
                    <div className="flex items-center justify-center w-full">
                        {steps.map((label, index) => {
                            const item = index + 1;

                            return (
                                <div
                                    key={item}
                                    className="flex items-center mt-0!"
                                >
                                    <button
                                        type="button"
                                        onClick={() => goToStep(item)}
                                        disabled={item > step + 1}
                                        aria-label={`Go to ${label}`}
                                        className={`
                                            relative
                                            flex
                                            items-center
                                            justify-center
                                            w-8
                                            h-8
                                            rounded-full
                                            text-xs
                                            font-medium
                                            transition-all
                                            duration-300
                                            ${
                                                item === step
                                                    ? `
                                                        scale-110
                                                        bg-black
                                                        text-white
                                                        shadow-md
                                                        ring-4
                                                        ring-black/10
                                                    `
                                                    : item < step
                                                        ? `
                                                            bg-black
                                                            text-white
                                                            cursor-pointer
                                                            hover:scale-105
                                                        `
                                                        : item === step + 1
                                                            ? `
                                                                bg-black/5
                                                                text-black/50
                                                                cursor-pointer
                                                                hover:bg-black/10
                                                            `
                                                            : `
                                                                bg-black/5
                                                                text-black/40
                                                                cursor-default
                                                            `
                                            }
                                        `}
                                    >
                                        {item < step ? "✓" : item}
                                    </button>

                                    {index < steps.length - 1 && (
                                        <div
                                            className={`
                                                mt-0!
                                                h-px
                                                w-6
                                                sm:w-14
                                                mx-2
                                                transition-all
                                                duration-500
                                                ${
                                                    item < step
                                                        ? "bg-black"
                                                        : "bg-black/10"
                                                }
                                            `}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-3 text-sm font-medium">
                        {steps[step - 1]}
                    </div>
                </div>

                <div className="my-auto!">
                    {/* FORM */}
                    <div className="relative w-full mt-0! px-2">
                        <div
                            key={step}
                            className="
                                animate-step-in
                                w-full
                            "
                        >
                            {/* STEP 1 - OVERVIEW */}
                            {step === 1 && (
                                <Tile
                                    title={steps[step - 1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                >
                                    <label htmlFor="title">
                                        Experience Title
                                    </label>

                                    <input
                                        id="title"
                                        name="title"
                                        placeholder="Title"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                    />

                                    <label htmlFor="company">
                                        Company
                                    </label>

                                    <input
                                        id="company"
                                        name="company"
                                        placeholder="Company"
                                        value={form.company}
                                        onChange={handleChange}
                                        required
                                    />

                                    <label htmlFor="description">
                                        Experience Description
                                    </label>

                                    <textarea
                                        ref={descriptionRef}
                                        id="description"
                                        name="description"
                                        placeholder="Description"
                                        value={form.description}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                        }}
                                        onChange={handleChange}
                                        onBlur={(e) => {
                                            setForm((prev) => ({
                                                ...prev,
                                                description:
                                                    ensurePunctuation(
                                                        e.target.value
                                                    ),
                                            }));
                                        }}
                                        required
                                    />

                                    <label htmlFor="tag">
                                        Tag
                                    </label>

                                    <div className="flex items-center justify-between gap-2 mt-0!">
                                        <select
                                            id="tag"
                                            name="tag"
                                            className="flex-1"
                                            value={
                                                useCustomTag
                                                    ? ""
                                                    : form.tag
                                            }
                                            onChange={(e) => {
                                                if (
                                                    e.target.value ===
                                                    "custom"
                                                ) {
                                                    setUseCustomTag(true);

                                                    setForm((prev) => ({
                                                        ...prev,
                                                        tag: "",
                                                    }));
                                                } else {
                                                    setUseCustomTag(false);

                                                    setForm((prev) => ({
                                                        ...prev,
                                                        tag:
                                                            e.target.value,
                                                    }));
                                                }
                                            }}
                                        >
                                            {props.tags.map((tag) => (
                                                <option
                                                    key={tag.id}
                                                    value={tag.name}
                                                >
                                                    {tag.name === ""
                                                        ? "No tag"
                                                        : tag.name}
                                                </option>
                                            ))}

                                            <option value="custom">
                                                Add new tag
                                            </option>
                                        </select>

                                        <DeleteButton
                                            disabled={
                                                !form.tag ||
                                                useCustomTag ||
                                                props.tags.find(
                                                    (tag) =>
                                                        tag.name ===
                                                        form.tag
                                                )?.builtin
                                            }
                                            itemName={form.tag}
                                            className="
                                                flex
                                                min-h-fit
                                                rounded-lg!
                                                self-start
                                            "
                                            x={4}
                                            y={1}
                                            action={async () => {
                                                if (!form.tag) return;

                                                await fetch(
                                                    "/api/tags",
                                                    {
                                                        method: "DELETE",
                                                        headers: {
                                                            "Content-Type":
                                                                "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                            name: form.tag,
                                                            category:
                                                                "experience",
                                                        }),
                                                    }
                                                );

                                                setForm((prev) => ({
                                                    ...prev,
                                                    tag: "",
                                                }));

                                                notify(
                                                    "Experience tag deleted successfully",
                                                    "success"
                                                );

                                                router.refresh();
                                            }}
                                        />
                                    </div>

                                    {useCustomTag && (
                                        <input
                                            id="custom-tag"
                                            placeholder="Add New Tag"
                                            value={capitalizeNamesAndTitles(
                                                customTag
                                            )}
                                            onChange={(e) => {
                                                const value =
                                                    e.target.value;

                                                setCustomTag(value);

                                                setForm((prev) => ({
                                                    ...prev,
                                                    tag: value,
                                                }));
                                            }}
                                            required
                                        />
                                    )}
                                </Tile>
                            )}

                            {/* STEP 2 - DETAILS */}
                            {step === 2 && (
                                <Tile
                                    title={steps[step - 1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                >
                                    <label htmlFor="start_date">
                                        Start Date
                                    </label>

                                    <div className="flex gap-2 mt-0!">
                                        <select
                                            value={Number(startMonth) - 1}
                                            onChange={(e) => {
                                                const month = String(
                                                    Number(e.target.value) + 1
                                                ).padStart(2, "0");

                                                setForm((prev) => ({
                                                    ...prev,
                                                    start_date:
                                                        `${startYear}${month}`,
                                                }));
                                            }}
                                        >
                                            {Array.from({ length: 12 }).map(
                                                (_, i) => (
                                                    <option
                                                        key={i}
                                                        value={i}
                                                    >
                                                        {new Date(
                                                            0,
                                                            i
                                                        ).toLocaleString(
                                                            "en",
                                                            {
                                                                month: "long",
                                                            }
                                                        )}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <select
                                            value={startYear}
                                            onChange={(e) => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    start_date:
                                                        `${e.target.value}${startMonth}`,
                                                }));
                                            }}
                                        >
                                            {Array.from({ length: 50 }).map(
                                                (_, i) => {
                                                    const year =
                                                        new Date().getFullYear() -
                                                        i;

                                                    return (
                                                        <option
                                                            key={year}
                                                            value={year}
                                                        >
                                                            {year}
                                                        </option>
                                                    );
                                                }
                                            )}
                                        </select>
                                    </div>

                                    <label htmlFor="end_date">
                                        End Date
                                    </label>

                                    <div className="flex gap-2 mt-0!">
                                        <select
                                            value={
                                                !form.end_date
                                                    ? ""
                                                    : Number(endMonth) - 1
                                            }
                                            onChange={(e) => {
                                                if (e.target.value === "") {
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        end_date: "",
                                                    }));

                                                    return;
                                                }

                                                const month =
                                                    String(
                                                        Number(
                                                            e.target.value
                                                        ) + 1
                                                    ).padStart(2, "0");

                                                setForm((prev) => ({
                                                    ...prev,
                                                    end_date:
                                                        `${endYear || currentYear}${month}`,
                                                }));
                                            }}
                                        >
                                            <option value="">
                                                Present
                                            </option>

                                            {Array.from({ length: 12 }).map(
                                                (_, i) => (
                                                    <option
                                                        key={i}
                                                        value={i}
                                                    >
                                                        {new Date(
                                                            0,
                                                            i
                                                        ).toLocaleString(
                                                            "en",
                                                            {
                                                                month: "long",
                                                            }
                                                        )}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <select
                                            value={endYear}
                                            onChange={(e) => {
                                                const year =
                                                    e.target.value;

                                                setForm((prev) => ({
                                                    ...prev,
                                                    end_date: year
                                                        ? `${year}${endMonth}`
                                                        : "",
                                                }));
                                            }}
                                        >
                                            <option value="">
                                                Present
                                            </option>

                                            {Array.from({ length: 50 }).map(
                                                (_, i) => {
                                                    const year =
                                                        new Date().getFullYear() -
                                                        i;

                                                    return (
                                                        <option
                                                            key={year}
                                                            value={year}
                                                        >
                                                            {year}
                                                        </option>
                                                    );
                                                }
                                            )}
                                        </select>
                                    </div>

                                    <label htmlFor="city">
                                        Company City
                                    </label>

                                    <input
                                        id="city"
                                        name="city"
                                        placeholder="City"
                                        value={form.city}
                                        onChange={handleChange}
                                    />

                                    <label htmlFor="region">
                                        Company Region
                                    </label>

                                    <input
                                        id="region"
                                        name="region"
                                        placeholder="Region"
                                        value={form.region}
                                        onChange={handleChange}
                                    />
                                </Tile>
                            )}

                            {/* STEP 3 - REVIEW */}
                            {step === 3 && (
                                <Tile
                                    title={steps[step - 1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                    childClassName="[&_div]:mt-0!"
                                >
                                    {/* OVERVIEW */}
                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-2
                                            p-4
                                            rounded-xl
                                            transition-colors
                                            duration-100
                                            hover:bg-gray-200
                                            hover:cursor-pointer
                                        "
                                        onClick={() => goToStep(1)}
                                    >
                                        <h2 className="text-[2rem] font-semibold text-center">
                                            {steps[0]}
                                        </h2>

                                        <div className="flex flex-wrap justify-between items-center gap-1">
                                            <h4>{form.title}</h4>
                                            {form.tag && (
                                                <Badge
                                                    text={form.tag}
                                                    px={2}
                                                    py={1}
                                                    textSize="xs"
                                                    shadow="none"
                                                    className="
                                                        h-fit
                                                        text-neutral-600! 
                                                        bg-neutral-200
                                                    "
                                                />
                                            )}
                                        </div>
                                        

                                        <div className="font-medium">
                                            {form.company}
                                        </div>

                                        <div className="
                                            flex
                                            prose
                                            prose-sm
                                            min-w-full
                                        ">
                                            <ReactMarkdown>
                                                {form.description}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* DETAILS */}
                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-2
                                            p-4
                                            rounded-xl
                                            transition-colors
                                            duration-100
                                            hover:bg-gray-200
                                            hover:cursor-pointer
                                        "
                                        onClick={() => goToStep(2)}
                                    >
                                        <h2 className="text-[2rem] font-semibold text-center">
                                            {steps[1]}
                                        </h2>

                                        <div>
                                            <span className="font-semibold">
                                                Start:
                                            </span>{" "}
                                            {new Date(
                                                Number(startYear),
                                                Number(startMonth) - 1
                                            ).toLocaleString("en", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </div>

                                        <div>
                                            <span className="font-semibold">
                                                End:
                                            </span>{" "}
                                            {form.end_date
                                                ? new Date(
                                                    Number(endYear),
                                                    Number(endMonth) - 1
                                                ).toLocaleString("en", {
                                                    month: "long",
                                                    year: "numeric",
                                                })
                                                : "Present"}
                                        </div>

                                        {(form.city ||
                                            form.region) && (
                                            <div>
                                                <span className="font-semibold">
                                                    Location:
                                                </span>{" "}
                                                {[
                                                    form.city,
                                                    form.region,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </div>
                                        )}
                                    </div>
                                </Tile>
                            )}
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="
                        flex
                        w-full
                        justify-between
                        px-4
                    ">
                        <Button
                            text="Back"
                            variant="secondary"
                            onClick={() => {
                                if (step !== 1) {
                                    setStep(step - 1);
                                } else {
                                    router.refresh();
                                    router.push(
                                        nextPage ?? "/experience"
                                    );
                                }
                            }}
                        />

                        {step !== 3 && (
                            <Button
                                text="Next"
                                onClick={() =>
                                    goToStep(step + 1)
                                }
                            />
                        )}

                        {step === 3 && (
                            <Button
                                text="Post"
                                type="submit"
                                name="mode"
                            />
                        )}
                    </div>                    
                </div>


            </form>
        </div>
    );
}