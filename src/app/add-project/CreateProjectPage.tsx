"use client";

import { useRef, useState } from "react";
import resizeImage from "@/lib/resizeImage";
import Tile from "@/components/Tile";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginResponse, Tag } from "@/lib/types";
import { capitalizeNamesAndTitles } from "@/lib/capitalizeNamesAndTitles";
import { ensurePunctuation } from "@/lib/ensurePunctuation";
import { useEffect } from "react";
import { normalizeArray } from "@/lib/normalizeJSON";
import DeleteButton from "@/components/DeleteButton";
import { useNotifications } from "@/components/NotificationProvider";
import ReactMarkdown from "react-markdown";
import Badge from "@/components/Badge";
import { shadow } from "@/lib/tags";
import { slugify } from "@/lib/slugify";
import DayPickerClient from "@/components/DayPicker";

export default function CreateProjectPage(props : {
    initialData? : any;
    tags : Tag[];
    statuses : Tag[];
    referrer ?: string | null;
}) {

    const [step, setStep] = useState(1);

    // Max image size is 200KB
    const MAX_SIZE = 0.2 * 1024 * 1024;

    const router = useRouter();
    const { notify } = useNotifications();

    const safeString = (v: any) => (v ?? "").toString();

    // Initial form data
    const [form, setForm] = useState({
        name: safeString(props.initialData?.name),
        slug: safeString(props.initialData?.slug),
        subtitle: safeString(props.initialData?.subtitle),
        description: safeString(props.initialData?.description),
        content: safeString(props.initialData?.content),
        link: safeString(props.initialData?.link),
        created_at: safeString(props.initialData?.created_at),
        languages: safeString(normalizeArray(props.initialData?.languages)).replace(/\s*,\s*/g, ", "),
        tools: safeString(normalizeArray(props.initialData?.tools)).replace(/\s*,\s*/g, ", "),
        libraries: safeString(normalizeArray(props.initialData?.libraries)).replace(/\s*,\s*/g, ", "),        
        tag: safeString(props.initialData?.tag),
        colour: safeString(props.initialData?.colour),
        status: safeString(props.initialData?.status),
        status_colour: safeString(props.initialData?.status_colour),
        pinned: !!props.initialData?.pinned,
        hidden: !!props.initialData?.hidden,
    });

    // Custom tag
    const [ customTag, setCustomTag ] = useState("");
    const [ useCustomTag, setUseCustomTag ] = useState(false);

    // Custom Status
    const [ customStatus, setCustomStatus ] = useState("");
    const [ useCustomStatus, setUseCustomStatus ] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const [ imageFile, setImageFile ] = useState<File | null>(null);
    const [ preview, setPreview ] = useState<string | null>(null);

    const [nextPage, setNextPage] = useState<string | null>(() => {
        if (typeof window === "undefined") return props.referrer ?? null;

        return sessionStorage.getItem("nextPage") ?? props.referrer ?? null;
    });

    // Setting data if loading a draft that exists
    useEffect(() => {
        if (!props.initialData) return;
        
        setPreview(props.initialData.imageUrl ?? null);
        
    }, [props.initialData]); 

    useEffect(() => {
        requestAnimationFrame(() => {
            const textareas = document.querySelectorAll("textarea");

            textareas.forEach((textarea) => {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            });
        });
    }, [form, step]);

    // Auto capitalize project name, tools and languages
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        let formattedValue = value;

        if (name === "name") {
            formattedValue = capitalizeNamesAndTitles(
                value.replace(/\s{2,}/g, ", ")
            );

            setForm((prev) => ({
                ...prev,
                name: formattedValue,
                slug: slugify(value),
            }));
        } else {
            const shouldCapitalize =
                name === "tools" ||
                name === "languages" ||
                name === "libraries";

            formattedValue = shouldCapitalize
                ? capitalizeNamesAndTitles(
                    value.replace(/\s*,\s*/g, ", ")
                )
                : value;

            setForm((prev) => ({
                ...prev,
                [name]: formattedValue,
            }));
        }
    };
  
    // Image select
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        
        const file = e.target.files?.[0];
        if (!file) return;

        // Resize image until it's under the max size
        let finalFile = await resizeImage(file, 1200, 0.8, 3 / 2);
        while (finalFile.size > MAX_SIZE) {
            finalFile = await resizeImage(finalFile, 1200, 0.8, 3 / 2);
        }

        setImageFile(finalFile);
        setPreview(URL.createObjectURL(finalFile));
    };

    // Image drop
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;

        // Resize image until it's under the max size
        let finalFile = await resizeImage(file, 1200, 0.8, 3 / 2);
        while (finalFile.size > MAX_SIZE) {
            finalFile = await resizeImage(finalFile, 1200, 0.8, 3 / 2);
        }

        setImageFile(finalFile);
        setPreview(URL.createObjectURL(finalFile));
    };

    // Form submit
    const handleSubmit = async (e: React.FormEvent) => {
        
        e.preventDefault();

        // No image file and no id means there is no image
        if (!imageFile && !props.initialData?.id) {
            notify("Please upload an image", "error");
            return;
        }

        const formData = new FormData();

        // If we already have an id we will add it to form
        if (props.initialData?.id) {
            formData.append("id", props.initialData.id);
        }

        // Append form data
        formData.append("name", form.name);
        formData.append("slug", form.slug);
        formData.append("subtitle", form.subtitle);
        formData.append("description", form.description);
        formData.append("content", form.content);
        formData.append("link", form.link);
        formData.append("created_at", form.created_at);
        formData.append("languages", form.languages);
        formData.append("tools", form.tools);
        formData.append("libraries", form.libraries);
        formData.append("tag", form.tag);
        formData.append("colour", form.colour);
        formData.append("status", form.status);
        formData.append("status_colour", form.status_colour);
        formData.append("pinned", form.pinned ? "1" : "0");
        formData.append("hidden", form.hidden ? "1" : "0");
        if (imageFile){
            formData.append("image", imageFile);
            formData.append("imageType", imageFile.type);            
        }

        const res = await fetch("/api/projects", {
            method: "POST",
            body: formData,
        });

        // Successful upload
        if (res.ok) {
            if (props.initialData?.id){
                notify("Project updated successfully", "success");
            }

            else {
                notify("Project uploaded successfully", "success");
            }

            router.refresh();
            router.push(nextPage ?? "/projects");
        } 

        // Unauthorized redirect to login
        else if (res.status == 401){
            router.push("/login");
        }

        // Slug already exists
        else if (res.status === 409) {
            const data = await res.json() as LoginResponse;

            notify(
                data.error || "A project with this slug already exists",
                "error"
            );
        }

        // Submission error
        else {
            const data = await res.json() as LoginResponse;

            if (props.initialData?.id) {
                notify(data.error || "Project update failed", "error");
            } else {
                notify(data.error || "Project upload failed", "error");
            }
        }
    };

    const steps = [
        "Overview",
        "Details",
        "Technologies",
        "Tags",
        "Review",
    ];

    const validateStep = (stepToValidate: number) => {
        switch (stepToValidate) {
            case 1:
                if (!form.name.trim()) {
                    notify("Please enter a project name", "error");
                    return false;
                }

                if (!form.description.trim()) {
                    notify("Please enter a project description", "error");
                    return false;
                }

                if (!imageFile && !props.initialData?.id) {
                    notify("Please upload an image", "error");
                    return false;
                }

                return true;

            case 2:
                if (!form.content.trim()) {
                    notify("Please write about your project", "error");
                    return false;
                }

                return true;

            case 3:
                return true;

            case 4:
                if (form.tag.trim() && !form.colour) {
                    notify("Please select a tag colour", "error");
                    return false;
                }

                if (form.status.trim() && !form.status_colour) {
                    notify("Please select a status colour", "error");
                    return false;
                }

                return true;

            default:
                return true;
        }
    };

    const goToStep = (targetStep: number) => {
        // Going backwards is always allowed
        if (targetStep < step) {
            setStep(targetStep);
            return;
        }

        // Staying on the same step
        if (targetStep === step) {
            return;
        }

        // Validate every step between the current step and target
        for (let currentStep = step; currentStep < targetStep; currentStep++) {
            if (!validateStep(currentStep)) {
                return;
            }
        }

        setStep(targetStep);
    };

    const { glowColour, glowRGB, borderColour } = shadow(form.colour);

    const { 
        glowColour: statusGlowColour, 
        glowRGB: statusGlowRGB, 
        borderColour: statusBorderColour
    } = shadow(form.status_colour);

    return (
        <div className="flex justify-center min-h-[90vh] max-h-fit">
            <form 
                className="
                    flex
                    flex-col
                    w-full
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
                            {step === 1 && (
                                <Tile
                                    title={steps[step-1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                >
                                    <label htmlFor="name">Project Name</label>
                                    <textarea
                                        id="name"
                                        name="name"
                                        placeholder="Name"
                                        value={form.name}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                        }}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        required
                                    />

                                    <label htmlFor="slug">Slug</label>
                                    <input
                                        id="slug"
                                        name="slug"
                                        value={form.slug}
                                        readOnly
                                        tabIndex={-1}
                                        className="cursor-not-allowed opacity-60"
                                        aria-label="Project slug, generated automatically"
                                    />

                                    <label htmlFor="description">Project Description</label>
                                    <textarea
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
                                            setForm({
                                                ...form,
                                                description: ensurePunctuation(e.target.value),
                                            });
                                        }}
                                        required
                                    />

                                    {/* IMAGE INPUT */}
                                    <div
                                        onDragOver={(e) => {e.preventDefault()}}
                                        onDrop={handleDrop}
                                        className="
                                            flex 
                                            flex-col 
                                            items-center
                                            justify-center
                                            gap-3
                                            min-h-32
                                            p-6
                                            m-1
                                            border-2
                                            border-dashed
                                            rounded-xl
                                            border-gray-400
                                            bg-gray-200
                                            cursor-pointer
                                            transition-colors
                                            duration-200
                                            hover:bg-gray-300
                                            hover:border-gray-500
                                        "
                                        onClick={() => inputRef.current?.click()} 
                                    >
                                        <input 
                                            id="thumbnail"
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                            ref={inputRef}
                                            className="hidden"
                                        />            
                                        <span className="font-medium">
                                            Drag & drop an image here
                                        </span>

                                        <span className="text-sm text-gray-500">
                                            or click to select
                                        </span>

                                        {preview && (
                                            <img src={preview} alt="Preview" className="max-w-1/2 self-center rounded-lg"/>
                                        )}
                                    </div>
                                    
                                </Tile>
                            )}
                            {step === 2 && (
                                <Tile
                                    title={steps[step-1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                >
                                    <label htmlFor="subtitle">Project Subtitle</label>
                                    <textarea
                                        id="subtitle"
                                        name="subtitle"
                                        placeholder="Subtitle"
                                        value={form.subtitle}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                        }}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />

                                    <label htmlFor="link">Project Link</label>
                                    <input
                                        id="link"
                                        name="link"
                                        type="url"
                                        placeholder="Link"
                                        value={form.link}
                                        onChange={handleChange}
                                    />

                                    <label htmlFor="created_at">Created Date</label>
                                    <DayPickerClient
                                        initialDate={
                                            form.created_at
                                                ? new Date(form.created_at)
                                                : undefined
                                        }
                                        onChange={(date) => {
                                            if (!date) return;

                                            setForm((prev) => ({
                                                ...prev,
                                                created_at: date.toISOString(),
                                            }));
                                        }}
                                        className="mt-0!"
                                    />
                                

                                    <label htmlFor="content">Project Content</label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        placeholder="Talk about your project"
                                        value={form.content}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                        }}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        required
                                    />
                                </Tile>
                            )}

                            {step === 3 && (
                                <Tile
                                    title={steps[step-1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                >
                                    <label htmlFor="languages">Languages Used</label>
                                    <textarea
                                        id="languages"
                                        name="languages"
                                        placeholder="Languages (comma separated)"
                                        value={form.languages}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                        }}
                                        onChange={handleChange}
                                    />

                                    <label htmlFor="libraries">Libraries Used</label>
                                    <textarea
                                        id="libraries"
                                        name="libraries"
                                        placeholder="Libraries (comma separated)"
                                        value={form.libraries}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                        }}
                                        onChange={handleChange}
                                    />

                                    <label htmlFor="tools">Tools Used</label>
                                    <textarea
                                        id="tools"
                                        name="tools"
                                        placeholder="Tools (comma separated)"
                                        value={form.tools}
                                        rows={1}
                                        style={{
                                            overflow: "hidden",
                                            resize: "none",
                                        }}
                                        onChange={handleChange}
                                    />
                                </Tile>
                            )}
                            {step === 4 && (
                                <Tile
                                    title={steps[step-1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                >
                                    {/* PROJECT TAGS */}
                                    <label htmlFor="tag">Tag</label>
                                    <div className="flex items-center justify-between gap-2 mt-0!">
                                        <select
                                            id="tag"
                                            name="tag"
                                            className="flex-1"
                                            value={form.tag}
                                                onChange={(e) => {
                                                    const selectedTag = props.tags.find(tag => tag.name === e.target.value);
                                                    if (e.target.value === "custom") {
                                                        setUseCustomTag(true);
                                                        setForm({ 
                                                            ...form, 
                                                            tag: "",
                                                            colour: "#FAE8FF"
                                                        });
                                                    } else {
                                                        setUseCustomTag(false);
                                                        setForm({ 
                                                            ...form, 
                                                            tag: e.target.value,
                                                            colour: selectedTag?.colour || form.colour
                                                        });
                                                    }
                                                    
                                                }}
                                        >

                                            {props.tags.map((tag) => (
                                                <option key={tag.id} value={tag.name}>
                                                    {tag.name === "" ? "No tag" : tag.name}
                                                </option>
                                            ))}

                                            <option value="custom">Add new tag</option>
                                        </select>

                                        <DeleteButton
                                            disabled={
                                                !form.tag ||
                                                useCustomTag || 
                                                props.tags.find(tag => tag.name === form.tag)?.builtin
                                            }
                                            itemName={form.tag}
                                            className="flex min-h-fit rounded-lg! self-start"
                                            x={4}
                                            y={1}
                                            action={async () => {
                                                if (!form.tag) return;

                                                await fetch("/api/tags", {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify({ 
                                                        name: form.tag,
                                                        category: "project",
                                                    }),
                                                });

                                                setForm((prev) => ({ ...prev, tag: "" }));

                                                notify("Project tag deleted successfully", "success");
                                                router.refresh();
                                            }}
                                        />
                                    </div>
                                    {useCustomTag && (
                                        <>
                                            <input
                                                id="tag"
                                                placeholder="Add New Tag"
                                                value={capitalizeNamesAndTitles(customTag)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setCustomTag(value);
                                                    setForm({ ...form, tag: value });
                                                }}
                                                required
                                            />
                                        </>
                                    )}
                                    {props.tags.find(tag => tag.name === form.tag)?.builtin ? null : (
                                        <>
                                            <label htmlFor="colour">Tag Color</label>
                                            <input
                                                id="colour"
                                                name="colour"
                                                type="color"
                                                placeholder="Colour"
                                                value={form.colour}
                                                onChange={(e) => {
                                                    setForm({ ...form, colour: e.target.value });
                                                }}
                                                required
                                            />
                                        </>
                                    )}

                                    {/* PROJECT STATUS */}
                                    <label htmlFor="status">Status</label>
                                    <div className="flex items-center justify-between gap-2 mt-0!">
                                        <select
                                            id="status"
                                            name="status"
                                            className="flex-1"
                                            value={form.status}
                                                onChange={(e) => {
                                                    const selectedStatus = props.statuses.find(status => status.name === e.target.value);
                                                    if (e.target.value === "custom-status") {
                                                        setUseCustomStatus(true);
                                                        setForm({ 
                                                            ...form, 
                                                            status: "",
                                                            status_colour: "#FAE8FF"
                                                        });
                                                    } else {
                                                        setUseCustomStatus(false);
                                                        setForm({ 
                                                            ...form, 
                                                            status: e.target.value,
                                                            status_colour: selectedStatus?.colour || form.status_colour
                                                        });
                                                    }
                                                    
                                                }}
                                        >

                                            {props.statuses.map((status) => (
                                                <option key={status.id} value={status.name}>
                                                    {status.name === "" ? "No status" : status.name}
                                                </option>
                                            ))}

                                            <option value="custom-status">Add new status</option>
                                        </select>

                                        <DeleteButton
                                            disabled={
                                                !form.status ||
                                                useCustomStatus || 
                                                props.statuses.find(status => status.name === form.status)?.builtin
                                            }
                                            itemName={form.status}
                                            className="flex min-h-fit rounded-lg! self-start"
                                            x={4}
                                            y={1}
                                            action={async () => {
                                                if (!form.status) return;

                                                await fetch("/api/tags", {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify({ 
                                                        name: form.status,
                                                        category: "status",
                                                    }),
                                                });

                                                setForm((prev) => ({ ...prev, status: "" }));

                                                notify("Project status deleted successfully", "success");
                                                router.refresh();
                                            }}
                                        />
                                    </div>
                                    {useCustomStatus && (
                                        <>
                                            <input
                                                id="status"
                                                placeholder="Add New Status"
                                                value={capitalizeNamesAndTitles(customStatus)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setCustomStatus(value);
                                                    setForm({ ...form, status: value });
                                                }}
                                                required
                                            />
                                        </>
                                    )}
                                    {props.statuses.find(status => status.name === form.status)?.builtin ? null : (
                                        <>
                                            <label htmlFor="status-colour">Status Color</label>
                                            <input
                                                id="status-colour"
                                                name="status-colour"
                                                type="color"
                                                placeholder="Colour"
                                                value={form.status_colour}
                                                onChange={(e) => {
                                                    setForm({ ...form, status_colour: e.target.value });
                                                }}
                                                required
                                            />
                                        </>
                                    )}
                                    {/* PIN & HIDE */}
                                    <div className="flex flex-wrap justify-evenly">
                                        <label className="flex gap-2 items-center cursor-pointer">
                                            <span>Pin Project</span>
                                            <input
                                                name="pinned"
                                                type="checkbox"
                                                className="mb-0!"
                                                checked={form.pinned}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            pinned: e.target.checked,
                                                        })
                                                    }
                                            />                            
                                        </label>
                                        
                                        <label className="flex gap-2 items-center cursor-pointer">
                                            <span>Hide Project</span>
                                            <input
                                                name="hidden"
                                                type="checkbox"
                                                className="mb-0!"
                                                checked={form.hidden}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            hidden: e.target.checked,
                                                        })
                                                    }
                                            />                            
                                        </label>
                                    </div>
                                </Tile>
                            )}
                            {step === 5 && (
                                <Tile
                                    title={steps[step-1]}
                                    disableHover={true}
                                    className="max-w-full flex-0"
                                    childClassName="[&_div]:mt-0!"
                                >
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
                                        onClick={() => goToStep(4)}
                                    >
                                        <h2 className="text-[2rem] font-semibold text-center">
                                            {steps[3]}
                                        </h2>
                                        <div className="grid grid-cols-3 items-center">
                                            {/* TAG */}
                                            <div className="justify-self-start">
                                                {form.tag && (
                                                    <h2
                                                        style={{
                                                            "--glow": glowRGB,
                                                            backgroundColor: form.colour,
                                                            color: glowColour,
                                                            borderColor: borderColour,
                                                        } as React.CSSProperties}
                                                        className="
                                                            self-center
                                                            sm:self-start
                                                            text-xl
                                                            min-w-fit
                                                            w-fit
                                                            inline-flex
                                                            text-center
                                                            justify-center
                                                            px-3
                                                            py-1
                                                            font-semibold
                                                            rounded-full
                                                            border
                                                            leading-none
                                                        "
                                                    >
                                                        {form.tag}
                                                    </h2>
                                                )}
                                            </div>

                                            {/* STATUS */}
                                            <div className="justify-self-center">
                                                {form.status && (
                                                    <Badge
                                                        text={form.status}
                                                        style={{
                                                            "--glow": statusGlowRGB,
                                                            backgroundColor: form.status_colour,
                                                            borderColor: statusBorderColour,
                                                            color: statusGlowColour,
                                                        } as React.CSSProperties}
                                                        className="border"
                                                    />
                                                )}
                                            </div>

                                            {/* PIN / HIDDEN */}
                                            <div className="flex flex-row gap-4 h-fit justify-self-end">
                                                {form.pinned && (
                                                    <Badge
                                                        text="Pinned"
                                                        className="bg-yellow-400"
                                                    />
                                                )}

                                                {form.hidden && (
                                                    <Badge
                                                        text="Hidden"
                                                        className="bg-orange-400"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    
                                    </div>
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
                                        <h4>{form.name}</h4>
                                        <div className="prose prose-sm">/projects/{form.slug}</div>
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
                                        
                                        {preview && (
                                            <img src={preview} alt="Preview" className="max-w-1/2 self-center"/>
                                        )}
                                    </div>
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

                                        {form.subtitle && (
                                            <div className="
                                                flex
                                                prose
                                                prose-sm
                                                min-w-full
                                            ">
                                                <ReactMarkdown>
                                                    {form.subtitle}
                                                </ReactMarkdown>
                                            </div>                                        
                                        )}

                                        {form.link && (
                                            <a
                                                href={
                                                    form.link.startsWith("http://") || form.link.startsWith("https://")
                                                        ? form.link
                                                        : `https://${form.link}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="
                                                    relative
                                                    z-10
                                                    text-sm
                                                    text-blue-600
                                                    hover:text-blue-800
                                                "
                                            >
                                                {form.link}
                                            </a>
                                        )}

                                        <div className="
                                            min-w-full

                                            prose
                                            prose-sm
                                            prose-a:text-blue-400
                                            prose-a:transition-colors
                                            prose-a:duration-100
                                            prose-a:no-underline
                                            prose-a:hover:text-blue-800
                                            prose-h1:mb-0
                                            prose-h1:text-6xl!
                                            prose-h2:mt-0
                                            prose-h2:mb-4
                                            prose-h2:text-4xl!
                                            prose-h3:mt-0
                                            prose-h3:text-2xl!
                                        ">
                                            <ReactMarkdown>
                                                {form.content}
                                            </ReactMarkdown>
                                        </div>  
                                    </div>

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
                                        onClick={() => goToStep(3)}
                                    >
                                        <h2 className="text-[2rem] font-semibold text-center">
                                            {steps[2]}
                                        </h2>
                                        {form.languages && (
                                            <div>
                                                <h4 className="font-semibold">Languages</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {form.languages.split(",").map((lang: string, i: number) => (
                                                        <Badge
                                                            key={i}
                                                            fontWeight="normal"
                                                            borderRadius="lg"
                                                            textSize="xs"
                                                            shadow="sm"
                                                            px={2}
                                                            py={1}
                                                            className="bg-gray-200 border border-gray-300"
                                                            text={lang}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {form.libraries && (
                                            <div>
                                                <h4 className="font-semibold">Libraries</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {form.libraries.split(",").map((lib: string, i: number) => (
                                                        <Badge
                                                            key={i}
                                                            fontWeight="normal"
                                                            borderRadius="lg"
                                                            textSize="xs"
                                                            shadow="sm"
                                                            px={2}
                                                            py={1}
                                                            className="bg-gray-100 border border-gray-300"
                                                            text={lib}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {form.tools && (
                                            <div>
                                                <h4 className="font-semibold">Tools</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {form.tools.split(",").map((tool: string, i: number) => (
                                                        <Badge
                                                            key={i}
                                                            fontWeight="normal"
                                                            borderRadius="lg"
                                                            textSize="xs"
                                                            shadow="sm"
                                                            px={2}
                                                            py={1}
                                                            className="bg-gray-300 border border-gray-400"
                                                            text={tool}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Tile>
                            )}    
                        </div>
                    </div>

                    {/* Button container */}
                    <div className="
                        flex
                        w-full 
                        justify-between
                        px-4
                        pb-4
                    ">
                        <Button
                            text="Back"
                            variant="secondary"
                            onClick={() => {
                                if (step !== 1) {
                                    setStep(step - 1)
                                }

                                else {
                                    router.refresh();
                                    router.push(nextPage ?? "/projects");
                                }
                            }}
                        />

                        {step !== 5 && (
                            <Button
                                text="Next"
                                onClick={() => goToStep(step + 1)}
                            />                        
                        )}

                        {step === 5 && (
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