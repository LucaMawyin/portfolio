export interface Env {
    luca_db: D1Database;
};

export type ProjectResponse = {
    projects : Project[];
}

export type Project= {
    id : number;
    name : string;
    slug: string;
    subtitle: string;
    description : string;
    content: string;
    link : string;
    image : string | null;
    image_type : string | null;
    languages : string | null;
    tools : string | null;
    libraries:  string | null;
    created_at : string;
    updated_at :string;
    deleted_at : string | null;
    tag : string;
    colour : string;
    status : string;
    status_colour : string;
    pinned : 1 | 0;
    hidden : 1 | 0;
    deleted : 1 | 0;
};

export type User = {
    id: number;
    email: string;
    password: string;
    first_name : string;
    last_name : string;
    created_at : string; 
    failed_attempts : number;
    locked_until : string;
};

export type SiteContent = {
    [key: string]: string;
};

export type LoginBody = {
    email: string;
    password: string;
};

export type Session = {
    id: number;
    token: string;
    user_id: number;
    created_at : string;
    expires_at: string;
    ip_address : string;
    geo : string;
    user_agent : string;
};

export type LoginResponse =
    | { status: "success" ; error : "" }
    | { status: "error"; error: string }
    | { status : "verification_required"; attemptId: number; error : "" };

export type ChangePasswordBody = {
    currentPassword: string;
    newPassword: string;
};

export type ChangePasswordResponse =
    | { success: true ; error : "" }
    | { success: false; error: string };

export type LoginVerification = {
    id: number;
    user_id: number;
    token: string;
    serial: string | null;
    type: "login" | "unlock";
    expires_at: string;
    ip_address: string;
    geo: string;
    user_agent: string;
};

export type VerifyLoginBody = {
    code: string;
    serial?: string;
};


export type Page = {
    title: string;
    href: string;
    section?: string;
    requireLogin: boolean;
    mobile?: boolean;
    newTab?: boolean;
};

export type Tag = {
    id : number;
    name : string;
    builtin : boolean;
    category : "project" | "experience" | "status"
    colour : string;
}

export type Tech = {
    id : number; 
    name : string;
    category : "tools" | "libraries" | "languages";
    iconPath?: string;
}

export type TechBody = {
    languages: string;
    tools: string;
    libraries: string;
};

export type Experience = {
    id : number;
    title : string;
    description : string;
    tag : string;
    city : string;
    region : string;
    start_date : string;
    end_date? : string;
    company : string;
}