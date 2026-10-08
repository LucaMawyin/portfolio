"use client";

import AddButton from "@/components/AddButton";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import DeleteButton from "@/components/DeleteButton";
import EditButton from "@/components/EditButton";
import { useNotifications } from "@/components/NotificationProvider";
import Tile from "@/components/Tile";
import { getDevice } from "@/lib/getDevice";
import resizeImage from "@/lib/resizeImage";
import { shadow } from "@/lib/tags";
import { ChangePasswordResponse, Project, Session, SiteContent, User } from "@/lib/types";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "Unknown";

    const value = date instanceof Date
        ? date
        : new Date(
            typeof date === "string" && !date.includes("T")
                ? date.replace(" ", "T") + "Z"
                : date
        );

    if (isNaN(value.getTime())) {
        return "Invalid date";
    }

    return value.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

export default function SettingsClient(props : {
    user : User, 
    content : SiteContent,
    activeSessions : Session[],
    currentSession : Session,
    projects : Project[],
}){

    const router = useRouter();
    const { notify } = useNotifications();

    // Resume file input stuff
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [resumeName, setResumeName] = useState<string | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeDragActive, setResumeDragActive] = useState(false);

    // Headshot file input stuff
    const headshotInputRef = useRef<HTMLInputElement>(null);
    const [headshotName, setHeadshotName] = useState<string | null>(null);
    const [headshotFile, setHeadshotFile] = useState<File | null>(null);
    const [headshotDragActive, setHeadshotDragActive] = useState(false);

    // Password states
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // About me
    const [ about, setAbout ] = useState(props.content.about || "");

    // Projects
    const [projects, setProjects] = useState<Project[]>(props.projects);
    const projectLengthIncrement = 4;
    const [visibleCount, setVisibleCount] = useState(projectLengthIncrement);
    const visibleProjects = projects
        .filter((project) => project.deleted === 0)
        .slice(0, visibleCount);

    // Deleted projects
    const deletedProjects = projects.filter(
        (project) => project.deleted === 1
    );
    const [showDeletedProjects, setShowDeletedProjects] = useState(false);

    useEffect(() => {
        if (deletedProjects.length === 0) {
            setShowDeletedProjects(false);
        }
    }, [deletedProjects.length]);

    useEffect(() => {
        const resizeTextAreas = () => {
            const textareas = document.querySelectorAll("textarea");
                textareas.forEach((ta) => {
                    ta.style.height = "auto";
                    ta.style.height = ta.scrollHeight + "px";
                }
            );
        }

        resizeTextAreas();

        // run on resize
        window.addEventListener("resize", resizeTextAreas);

        // cleanup
        return () => {
            window.removeEventListener("resize", resizeTextAreas);
        };

    }, []);

    const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!headshotFile) {
            setHeadshotPreview(null);
            return;
        }

        const url = URL.createObjectURL(headshotFile);
        setHeadshotPreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [headshotFile]);


    // Handling password change
    async function handlePasswordChange(
        e: React.FormEvent
    ){
        e.preventDefault();

        // Simple password check
        if (newPassword !== confirmPassword){
            notify("Passwords do not match")
            return;
        }

        // Changing password
        const response = await fetch("/api/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
            }),
        });

        const data = await response.json() as ChangePasswordResponse;

        // Showing success or error message for 300ms
        if (response.ok){
            notify("Password updated", "success")
        } else {
            notify(data.error || "Failed to update password", "error")
        }
    }


    // Resume pdf drop
    const handleResumeDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setResumeDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            notify("Only PDF files are allowed for resume", "error");
            return;
        }

        setResumeFile(file);
        setResumeName(file.name);
    };

    // Resume submit
    const handleResumeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // No resume file
        if (!resumeFile) {
            notify("Please select a resume first", "error")
            return;
        }

        // Uploading file
        const formData = new FormData();
        formData.append("file", resumeFile);
        formData.append("name", "resume");
        formData.append("type", "pdf");

        const res = await fetch("/api/upload-file", {
            method: "POST",
            body: formData,
        });

        const data = await res.json() as any;

        // Error
        if (!res.ok) {
            notify(data.error || "Resume upload failed", "error")
            return;
        }

        // Nullify files
        setResumeFile(null);
        setResumeName(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // Success message
        notify("Successfully Uploaded Resume", "success")
    };

    // Resize headshot
    const MAX_SIZE = 0.5 * 1024 * 1024; // Max size is 500kb
    const processHeadshot = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            throw new Error("Only images are allowed");
        }

        let finalFile = await resizeImage(file, 1200, 0.8, 3 / 4);
        while (finalFile.size > MAX_SIZE) {
            finalFile = await resizeImage(finalFile, 1200, 0.8, 3 / 4);
        }

        return finalFile;
    };

    // Headshot image drop
    const handleHeadshotDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setHeadshotDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        try {
            const finalFile = await processHeadshot(file);

            setHeadshotFile(finalFile);
            setHeadshotName(finalFile.name);
        } catch {
            notify("Only images are allowed for headshot", "error");
        }
    };

    // Headshot submit
    const handleHeadshotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // No image
        if (!headshotFile) {
            notify("Please select an image for headshot", "error")
            return;
        }

        // FormData
        const formData = new FormData();
        formData.append("file", headshotFile);
        formData.append("name", "headshot");
        formData.append("type", "image");

        // API call
        const res = await fetch("/api/upload-file", {
            method: "POST",
            body: formData,
        });

        const data = await res.json() as any;

        // Error
        if (!res.ok) {
            notify(data.error || "Headshot upload failed", "error")
            return;
        }

        // Nullify files
        setHeadshotFile(null);
        setHeadshotName(null);

        if (headshotInputRef.current) {
            headshotInputRef.current.value = "";
        }

        // Success message
        notify("Successfully uploaded headshot", "success")
    };

    // Updating about me
    async function handleAboutSubmit() {

        if (!about.length){
            notify("Please enter a bio", "error")
            return;
        }

        const res = await fetch("/api/update-about", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ about }),
        });

        const data = await res.json() as any;

        // Error
        if (!res.ok) {
            notify(data.error || "Failed to update about", "error")

            router.refresh();
            return;
        }

        // Success message
        notify("Successfully changed about me", "success")
    }

    // Clearing all active sessions
    async function handleClearSessions(){
        const res = await fetch("/api/clear-sessions", {
            method: "POST",
        });

        const data = await res.json() as any;

        // Error
        if (!res.ok) {
            notify(data.error || "Failed to Clear Sessions", "error")
            return;
        }

        router.refresh();

        // Success message
        notify("Successfully cleared all active sessions", "success")
    }

    // Removing individual session
    async function handleRemoveSession(id: number) {
        const res = await fetch("/api/remove-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });

        const data = await res.json() as any;

        if (!res.ok) {
            notify(data.error || "Failed to remove session", "error")
            return;
        }

        await router.refresh();

        notify("Successfully removed session", "success")
    }

    return (
        <div className="
            mt-[10vh]
            min-h-[90dvh]
            flex flex-wrap justify-center items-center
        ">
            <div
                className="
                    flex flex-wrap
                    justify-center
                    w-full
                    min-h-[90dvh]
                "
            >

                {/* INFO & ABOUT */}
                <Tile 
                    title="Profile Settings"
                    disableHover={true}
                    className="lg:max-w-[40vw] shadow-none pb-0"
                    childClassName="mt-0! flex-1 justify-center"
                    titleClassName="border-b"
                    disablePillow={true}
                >

                    {/* ABOUT ME */}
                    <div className="space-y-4 py-6 border-b">
                        <h2 className="text-xl">
                            About Me
                        </h2>
                        <div className="flex flex-col gap-4">
                            <textarea
                                name="about-me"
                                value={about}
                                className="
                                    w-full
                                    min-h-28
                                    rounded-md
                                    text-sm
                                    text-gray-700
                                    bg-gray-50
                                "
                                rows={1}
                                style={{
                                    overflow: "hidden",
                                    resize: "none",
                                }}
                                onChange={(e) => {
                                    setAbout(e.target.value)
                                    if (e.target instanceof HTMLTextAreaElement) {
                                        const el = e.target;
                                        el.style.height = "auto";
                                        el.style.height = el.scrollHeight + "px";
                                    }
                                }}
                            />

                            <Button
                                text="Change About"
                                className="w-full sm:w-fit"
                                x={4}
                                y={2}
                                onClick={handleAboutSubmit}
                            />                            
                        </div>
                    </div>

                    {/* HEADSHOT UPLOAD */}
                    <div className="py-6 border-b">
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={handleHeadshotSubmit}
                        >
                            <h2 className="text-xl">
                                Upload New Headshot
                            </h2>

                            <div
                                className={`
                                    relative
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-3
                                    min-h-40
                                    p-4
                                    rounded-xl
                                    border-2
                                    border-dashed
                                    transition-all
                                    duration-(--transition-duration)
                                    cursor-pointer
                                    ${
                                        headshotDragActive
                                            ? "border-gray-500 bg-gray-100"
                                            : "border-gray-300 bg-gray-50"
                                    }
                                `}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setHeadshotDragActive(true);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setHeadshotDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setHeadshotDragActive(false);
                                }}
                                onDrop={handleHeadshotDrop}
                                onClick={() => headshotInputRef.current?.click()}
                            >
                                <input
                                    id="headshot"
                                    name="headshot"
                                    type="file"
                                    ref={headshotInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        try {
                                            const finalFile = await processHeadshot(file);

                                            setHeadshotFile(finalFile);
                                            setHeadshotName(finalFile.name);
                                        } catch {
                                            notify(
                                                "Only images are allowed for headshot",
                                                "error"
                                            );
                                        }
                                    }}
                                />

                                {headshotPreview ? (
                                    <>
                                        <img
                                            src={headshotPreview}
                                            alt="Selected headshot preview"
                                            className="
                                                max-h-32
                                                max-w-full
                                                rounded-lg
                                                object-contain
                                                shadow
                                            "
                                        />

                                        <p className="text-sm text-gray-500 wrap-break-word text-center">
                                            {headshotName}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            Click or drop another image to replace
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center">
                                            <p className="font-medium">
                                                Drag & drop an image here
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                or click to select an image
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button
                                text="Submit Headshot"
                                type="submit"
                                className="w-full sm:w-fit"
                                x={4}
                                y={2}
                            />
                        </form>
                    </div>

                    {/* RESUME UPLOAD */}
                    <div className="py-6 border-b sm:border-b-0">
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={handleResumeSubmit}
                        >
                            <h2 className="text-xl">
                                Upload New Resume
                            </h2>

                            <div
                                className={`
                                    relative
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-3
                                    min-h-40
                                    p-4
                                    rounded-xl
                                    border-2
                                    border-dashed
                                    transition-all
                                    duration-(--transition-duration)
                                    cursor-pointer
                                    ${
                                        resumeDragActive
                                            ? "border-gray-500 bg-gray-100"
                                            : "border-gray-300 bg-gray-50"
                                    }
                                `}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setResumeDragActive(true);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setResumeDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setResumeDragActive(false);
                                }}
                                onDrop={handleResumeDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    id="resume"
                                    name="resume"
                                    type="file"
                                    ref={fileInputRef}
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        if (file.type !== "application/pdf") {
                                            notify(
                                                "Only PDF files are allowed for resume",
                                                "error"
                                            );
                                            return;
                                        }

                                        setResumeFile(file);
                                        setResumeName(file.name);
                                    }}
                                />

                                {resumeName ? (
                                    <>
                                        <div className="text-center">
                                            <p className="text-lg font-medium">
                                                PDF selected
                                            </p>

                                            <p className="text-sm text-gray-500 wrap-break-word">
                                                {resumeName}
                                            </p>

                                            {resumeFile && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-400">
                                            Click or drop another PDF to replace
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <p className="font-medium">
                                            Drag & drop your resume here
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            or click to select a PDF
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Button
                                text="Submit Resume"
                                type="submit"
                                className="w-full sm:w-fit"
                                x={4}
                                y={2}
                            />
                        </form>
                    </div>

                </Tile>

                {/* SECURITY */}
                <Tile
                    className="lg:max-w-[40vw] shadow-none pb-0"
                    disableHover={true}
                    childClassName="mt-0! flex-1 justify-center"
                    disablePillow={true}
                >

                    {/* Change password section */}
                    <div className="space-y-4 pb-6 border-b">
                        <h2 className="text-xl">
                            Change Password
                        </h2>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="current-password"
                                className="text-gray-500"
                            >
                                Current Password
                            </label>
                            <div className="flex gap-2 w-full">
                                <input
                                    id="current-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="flex-1"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    className="flex-0 hover:cursor-pointer"
                                    onClick={() => setShowPassword((p) => !p)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <label
                                htmlFor="new-password"
                                className="text-gray-500"
                            >
                                New Password
                            </label>
                            <div className="flex w-full">
                                <input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    name="new-password"
                                    className="flex-1"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <label
                                htmlFor="confirm-new-password"
                                className="text-gray-500"
                            >
                                Confirm New Password
                            </label>
                            <div className="flex w-full">
                                <input
                                    id="confirm-new-password"
                                    type={showPassword ? "text" : "password"}
                                    name="confirm-new-password"
                                    className="flex-1"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex pt-2">
                                <Button 
                                    text="Change Password" 
                                    type="submit"
                                    className="w-full sm:w-fit"
                                    x={4}
                                    y={2}
                                    onClick={handlePasswordChange}
                                />  
                            </div>
                          
                        
                        </div>
                        
                    </div>

                    {/* Active sessions */}
                    <div className="py-6">
                        <h2 className="text-xl mb-4">
                            Active Sessions
                        </h2>
                        <div className="space-y-2 [&_span]:text-gray-500">
                            {props.activeSessions.map((session : Session) => (
                                <details 
                                    key={session.id} 
                                    className="
                                        bg-gray-100 
                                        wrap-break-word 
                                        pillow
                                        squircle-large
                                    "
                                >
                                    <summary className="
                                        cursor-pointer 
                                        font-medium
                                        flex
                                        items-center
                                        justify-between
                                        p-4
                                        squircle-large
                                        pillow-hover-dark
                                        transition-all
                                        duration-(--transition-duration)
                                    ">
                                        <div>
                                            <p>
                                                {getDevice(session.user_agent)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Session {session.id}
                                            </p>
                                        </div>
                                        
                                        {props.currentSession.id === session.id && (
                                            <span className="
                                                text-sm
                                                text-gray-500
                                                bg-gray-200
                                                px-2
                                                py-1
                                                rounded-full
                                            ">
                                                Current
                                            </span>
                                        )}
                                    </summary>

                                    <div className="space-y-1 p-4 pt-0">
                                        <p><span>Device: </span>{getDevice(session.user_agent)}</p>
                                        <p><span>IP Address: </span>{session.ip_address}</p>
                                        <p>
                                            <span>Location: </span>
                                            {(() => {
                                                try {
                                                    const geo = JSON.parse(session.geo);
                                                    return `${geo.city}, ${geo.country}`;
                                                } catch {
                                                    return session.geo;
                                                }
                                            })()}
                                        </p>
                                        <p>
                                            <span>Created: </span>
                                            {new Date(session.created_at.replace(" ", "T") + "Z").toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        <p>
                                            <span>Expires: </span>
                                            {new Date(session.expires_at.replace(" ", "T") + "Z").toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </p>       
                                        {props.currentSession.id !== session.id && (
                                            <DeleteButton
                                                buttonText="Remove Session"
                                                actionName="Remove"
                                                itemName="Session"
                                                className="w-full sm:w-fit"
                                                x={2}
                                                y={0}
                                                action={() => handleRemoveSession(session.id)}
                                            />
                                        )}                              
                                    </div>
                                    
     

                                </details>
                            ))}
                            <DeleteButton
                                buttonText="Clear All Sessions"
                                actionName="Clear"
                                itemName="All Sessions"
                                className="w-full sm:w-fit mt-6"
                                x={4}
                                y={2}
                                action={handleClearSessions}
                            />                             
                        </div>

                    </div>
                </Tile>


            </div>
            <div className="
                flex flex-wrap
                justify-center
                w-full
                max-h-fit
            ">
                <Tile
                    title="Projects"
                    disableHover={true}
                    className="lg:max-w-[80vw] shadow-none py-0"
                    childClassName="mt-0!"
                    titleClassName="border-b"
                    disablePillow={true}
                >
                    <AddButton
                        className="mt-4 w-full sm:w-fit self-center"
                        text="Add Project"
                        x={4}
                        y={2}
                        action={() =>
                        router.push(
                            "/add-project"
                        )}
                    />
                    {visibleProjects.length > 0 && 
                        <div className="
                            grid
                            grid-cols-1
                            lg:grid-cols-2
                            items-stretch
                            auto-rows-fr
                            mt-4
                            gap-4
                        ">
                            {visibleProjects.map((project) => (
                                <div 
                                    key={project.id}
                                    className="
                                        flex
                                        flex-wrap
                                        justify-between
                                        rounded-lg 
                                        p-4
                                        gap-2
                                        transition
                                        pillow
                                        squircle-large
                                        pillow-hover
                                        hover:cursor-pointer
                                        hover:scale-(--subtle-scale)
                                    "
                                    onClick={() => router.push(`/projects/${project.slug}`)}
                                >
                                    <div className="
                                        flex 
                                        flex-col 
                                        flex-1 
                                        min-w-[70%] 
                                        wrap-break-word
                                        [&_span]:text-gray-500
                                        gap-1
                                        mb-auto
                                    ">
                                        
                                        {/* PROJECT PIN & HIDDEN */}
                                        <div className="
                                            flex 
                                            gap-4
                                        ">
                                            <p className="font-medium">{project.name}</p>
                                            {project.status && (

                                                <Badge
                                                    text={project.status}
                                                    shadow="none"
                                                    textSize="base"
                                                    py={0}
                                                    fontWeight="normal"
                                                    style={
                                                        {
                                                            color: shadow(project.status_colour).glowColour,
                                                            backgroundColor: project.status_colour,
                                                            borderColor: shadow(project.status_colour).borderColour,
                                                        }
                                                    }
                                                    className="border font-normal"
                                                />
                                        
                                            )}        
                                        </div>   

                                        {(project.pinned === 1 || project.hidden === 1) && (
                                            <div className="flex gap-4">
                                                {/* PIN */}
                                                {(project.pinned === 1) && (
                                                    <Badge
                                                        text="Pinned"
                                                        className="bg-yellow-400"
                                                        shadow="none"
                                                    />
                                                )}

                                                {/* HIDDEN */}
                                                {(project.hidden === 1) && (
                                                    <Badge
                                                        text="Hidden"
                                                        className="bg-orange-400"
                                                        shadow="none"
                                                    />
                                                )}
                                            </div>
                                        )}
  

                                        {project.tag && (
                                            <div className="flex gap-2">
                                                <span>Tag: </span>

                                                <Badge
                                                    text={project.tag}
                                                    shadow="none"
                                                    fontWeight="normal"
                                                    textSize="base"
                                                    py={0}
                                                    className="border"
                                                    style={
                                                        {
                                                            color: shadow(project.colour).glowColour,
                                                            backgroundColor: project.colour,
                                                            borderColor: shadow(project.colour).borderColour,
                                                        }
                                                    }
                                                />
                                            </div>                                            
                                        )}

                                        <p>
                                            <span>Created: </span>
                                            {formatDate(project.created_at)}
                                        </p>
                                        <p>
                                            <span>Updated: </span>
                                            {new Date(project.updated_at.replace(" ", "T") + "Z").toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </p>

                                        {!!project.link && (
                                            <p className="flex flex-wrap">
                                                <span>Link:&nbsp;</span>
                                                <a 
                                                    href={project.link}
                                                    target="_blank"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="
                                                        block
                                                        max-w-[75%]
                                                        truncate
                                                        text-blue-300
                                                        hover:text-blue-600
                                                        transition-all
                                                        ease-in-out
                                                        duration-50
                                                    "
                                                >
                                                    {project.link}
                                                </a>
                                            </p>
                                        )}
                                        {project.languages && (
                                            <p>
                                                <span>Languages: </span>
                                                {JSON.parse(project.languages).join(", ")}
                                            </p>                                            
                                        )}
                                        {project.libraries && (
                                            <p>
                                                <span>Libraries: </span>
                                                {JSON.parse(project.libraries).join(", ")}
                                            </p>                                            
                                        )}
                                        {project.tools && (
                                            <p>
                                                <span>Tools: </span>
                                                {JSON.parse(project.tools).join(", ")}
                                            </p>                                            
                                        )}

                                    </div>

                                    {/* Delete/Edit Buttons */}
                                    <div 
                                        className="flex flex-row gap-4 w-full mt-auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <EditButton
                                            action={() => {
                                                router.push(`add-project/edit?id=${project.id}`)
                                            }}
                                        />
                                        <DeleteButton
                                            text="Project"
                                            action={async () => {
                                                const res = await fetch("/api/projects", {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify({ id: project.id }),
                                                });

                                                if (res.status === 401) {
                                                    router.push("/login");
                                                    return;
                                                }

                                                if (!res.ok) {
                                                    return;
                                                }
                                                
                                                setProjects((prev) =>
                                                    prev.map((p) =>
                                                        p.id === project.id
                                                            ? {
                                                                ...p,
                                                                deleted: 1,
                                                                deleted_at: new Date()
                                                                    .toISOString()
                                                                    .slice(0, 19)
                                                                    .replace("T", " "),
                                                            }
                                                            : p
                                                    )
                                                );

                                                notify("Project deleted successfully", "success");
                                            }}
                                        />                        
                                    </div>
                                </div>
                            ))}
                        </div> 
                    }
                    
                    <div className="
                        flex 
                        flex-wrap 
                        justify-center 
                        mt-4
                        mb-6
                        gap-4
                    ">
                        {visibleCount > projectLengthIncrement && (
                            <button
                                onClick={() => setVisibleCount((prev) => prev - projectLengthIncrement)}
                                className="
                                    cursor-pointer
                                    w-24
                                    h-10 
                                    p-3

                                    flex 
                                    items-center 
                                    justify-center

                                    rounded-xl
                                    transition-all
                                    duration-(--transition-duration)
                                    pillow 
                                    squircle
                                    hover:scale-(--subtle-scale)
                                "
                            >
                                <img
                                    src="/arrow-up.svg"
                                    className="h-6"
                                />
                            </button>
                        )}                        

                        {visibleCount < projects.length && (
                            <button
                                onClick={() => setVisibleCount((prev) => prev + projectLengthIncrement)}
                                className="
                                    cursor-pointer
                                    w-24
                                    h-10 
                                    p-3

                                    flex 
                                    items-center 
                                    justify-center

                                    rounded-xl
                                    transition-all
                                    duration-(--transition-duration)
                                    pillow
                                    squircle
                                    hover:scale-(--subtle-scale)
                                "
                            >
                                <img
                                    src="/arrow-down.svg"
                                    className="h-6"
                                />
                            </button>

                        )}
                    </div>
                </Tile>
            </div>


            {/* DELETED PROJECTS */}
            {deletedProjects.length > 0 && (
                <Button
                    x={4}
                    y={2}
                    text={showDeletedProjects ? "Hide Deleted Projects" : "Show Deleted Projects"}
                    className="w-fit self-center my-4"
                    onClick={() => setShowDeletedProjects((prev) => !prev)}
                />                
            )}

            {showDeletedProjects && (
                <div className="
                    flex flex-wrap
                    justify-center
                    w-full
                    max-h-fit
                ">

                    <Tile
                        title="Deleted Projects"
                        disableHover={true}
                        className="lg:max-w-[80vw] shadow-none py-0"
                        childClassName="mt-0!"
                        titleClassName="border-b"
                        disablePillow={true}
                    >
                        { 
                            <div className="
                                grid
                                grid-cols-1
                                lg:grid-cols-2
                                items-stretch
                                auto-rows-fr
                                mt-4
                                mb-6
                                gap-4
                            ">
                                {deletedProjects.map((project) => (
                                    <div 
                                        key={project.id}
                                        className="
                                            flex
                                            flex-wrap
                                            justify-between
                                            bg-gray-100 
                                            rounded-lg 
                                            p-4
                                            gap-2
                                            pillow
                                            squircle-large
                                        "
                                    >
                                        <div className="
                                            flex 
                                            flex-col 
                                            flex-1 
                                            min-w-[70%] 
                                            wrap-break-word
                                            [&_span]:text-gray-500
                                            gap-1
                                        ">
                                            
                                            {/* PROJECT PIN & HIDDEN */}
                                            <div className="
                                                flex 
                                                gap-4
                                            ">
                                                <p className="font-medium">{project.name}</p>
                                                {project.status && (

                                                    <Badge
                                                        text={project.status}
                                                        shadow="none"
                                                        textSize="base"
                                                        py={0}
                                                        fontWeight="normal"
                                                        style={
                                                            {
                                                                color: shadow(project.status_colour).glowColour,
                                                                backgroundColor: project.status_colour,
                                                                borderColor: shadow(project.status_colour).borderColour,
                                                            }
                                                        }
                                                        className="border font-normal"
                                                    />
                                            
                                                )}        
                                            </div>   

                                            <div className="flex gap-4">
                                                {/* DELETED */}
                                                <Badge
                                                    text="Deleted"
                                                    className="bg-red-400"
                                                    shadow="none"
                                                />

                                                {/* PIN */}
                                                {(project.pinned === 1) && (
                                                    <Badge
                                                        text="Pinned"
                                                        className="bg-yellow-400"
                                                        shadow="none"
                                                    />
                                                )}

                                                {/* HIDDEN */}
                                                {(project.hidden === 1) && (
                                                    <Badge
                                                        text="Hidden"
                                                        className="bg-orange-400"
                                                        shadow="none"
                                                    />
                                                )}
                                            </div>
    

                                            {project.tag && (
                                                <div className="flex gap-2">
                                                    <span>Tag: </span>

                                                    <Badge
                                                        text={project.tag}
                                                        shadow="none"
                                                        fontWeight="normal"
                                                        textSize="base"
                                                        py={0}
                                                        className="border"
                                                        style={
                                                            {
                                                                color: shadow(project.colour).glowColour,
                                                                backgroundColor: project.colour,
                                                                borderColor: shadow(project.colour).borderColour,
                                                            }
                                                        }
                                                    />
                                                </div>                                            
                                            )}

                                            <p>
                                                <span>Created: </span>
                                                {formatDate(project.created_at)}
                                            </p>
                                            <p>
                                                <span>Updated: </span>
                                                {new Date(project.updated_at.replace(" ", "T") + "Z").toLocaleString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                            <p>
                                                <span>Deleted: </span>
                                                {new Date(project.deleted_at?.replace(" ", "T") + "Z").toLocaleString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                            {!!project.link && (
                                                <p className="flex flex-wrap">
                                                    <span>Link:&nbsp;</span>
                                                    <a 
                                                        href={project.link}
                                                        target="_blank"
                                                        className="
                                                            block
                                                            max-w-[75%]
                                                            truncate
                                                            text-blue-300
                                                            hover:text-blue-600
                                                            transition-all
                                                            ease-in-out
                                                            duration-50
                                                        "
                                                    >
                                                        {project.link}
                                                    </a>
                                                </p>
                                            )}
                                            {project.languages && (
                                                <p>
                                                    <span>Languages: </span>
                                                    {JSON.parse(project.languages).join(", ")}
                                                </p>                                            
                                            )}
                                            {project.libraries && (
                                                <p>
                                                    <span>Libraries: </span>
                                                    {JSON.parse(project.libraries).join(", ")}
                                                </p>                                            
                                            )}
                                            {project.tools && (
                                                <p>
                                                    <span>Tools: </span>
                                                    {JSON.parse(project.tools).join(", ")}
                                                </p>                                            
                                            )}

                                        </div>

                                        {/* Delete/Edit Buttons */}
                                        <div className="flex flex-row gap-4 w-full mt-auto">
                                            <Button
                                                onClick={async () => {
                                                    const res = await fetch("/api/projects", {
                                                        method: "PATCH",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({ id: project.id }),
                                                    });

                                                    if (res.status === 401) {
                                                        router.push("/login");
                                                        return;
                                                    }

                                                    if (!res.ok) {
                                                        return;
                                                    }

                                                    setProjects((prev) =>
                                                        prev.map((p) =>
                                                            p.id === project.id
                                                                ? { ...p, deleted: 0, deleted_at: null }
                                                                : p
                                                        )
                                                    );

                                                    notify("Project restored successfully", "success");
                                                }}
                                            >
                                                <RotateCcw size={18} />
                                            </Button>
                                            <DeleteButton
                                                text="Project"
                                                action={async () => {
                                                    const res = await fetch("/api/projects", {
                                                        method: "DELETE",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({ id: project.id }),
                                                    });

                                                    if (res.status === 401) {
                                                        router.push("/login");
                                                        return;
                                                    }
                                                    
                                                    setProjects((prev) =>
                                                        prev.filter((p) => p.id !== project.id)
                                                    );

                                                    notify("Project permanently deleted successfully", "success");
                                                }}
                                            />                        
                                        </div>
                                    </div>
                                ))}
                            </div> 
                        }
                    </Tile>                
                </div>
            )}

        </div>
    );
}