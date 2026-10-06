import { validateSession } from "@/lib/auth";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { Metadata } from "next";
import Footer from "@/components/Footer";
import { NotificationProvider } from "@/components/NotificationProvider";
import SmoothScroll from "@/components/SmoothScroll";

export const dynamic = "force-dynamic";

const description = "Luca Mawyin is a software developer and McMaster Computer Science student focused on building clean, intuitive web applications"
const siteUrl = "https://lucamawyin.com"

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "Luca Mawyin | Software Developer",
    applicationName: "Luca Mawyin Portfolio",
    category: "technology",
    icons: {
        icon: [
            {
                url: "/favicon.svg",
                type: "image/svg+xml",
            },
        ],
    },
    description,
    keywords: [
        // Identity
        "Luca Mawyin",
        "Luca Mawyin Developer",
        "Luca Mawyin Portfolio",
        "Luca Mawyin Software Developer",

        // Role
        "Software Developer",
        "Software Engineer",
        "Full Stack Developer",
        "Web Developer",
        "Frontend Developer",
        "Backend Developer",

        // Education
        "McMaster University",
        "McMaster Computer Science",
        "Computer Science Student",

        // Web Development
        "Web Applications",
        "API Development",
        "UI Development",
        "Database Design",
        "Cloud Computing",

        // Main Technologies
        "React Developer",
        "Next.js Developer",
        "TypeScript Developer",
        "Node.js Developer",
        "Python Developer",
        "Java Developer",
        "C++ Developer",

        // Cloud / Infrastructure
        "Cloudflare Developer",
        "Cloudflare Workers",
        "AWS Developer",

        // AI / Computer Vision
        "Machine Learning Developer",
        "Computer Vision Developer",
        "OpenCV",
        "PyTorch",
        "YOLO",

        // General
        "Developer Portfolio",
        "Software Portfolio",
    ],
    authors:[
        {
            name: "Luca Mawyin",
            url: siteUrl,
        }
    ],
    creator: "Luca Mawyin",
    publisher: "Luca Mawyin",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
        },
    },
    alternates:{
        canonical: "/",
    },
    openGraph: {
        type: "website",
        title: "Luca Mawyin | Software Developer",
        description,
        siteName: "Luca Mawyin",
        images: [
            {
                url: "/og-image.png",
                width:800,
                height:800,
                alt: "Luca Mawyin | Software Developer",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Luca Mawyin | Software Developer",
        description,
        images: ["/og-image.png"],
    }
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Luca Mawyin | Software Developer",
        url: siteUrl,
        description,
        author: {
            "@type": "Person",
            name: "Luca Mawyin",
            url: siteUrl,
        },
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Luca Mawyin",
        url: siteUrl,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": siteUrl,
        },
        jobTitle: "Luca Mawyin | Software Developer",
        description,
        sameAs: [
            "https://github.com/LucaMawyin",
            "https://www.linkedin.com/in/lucamawyin",
        ],
        knowsAbout: [
            "Software Development",
            "Web Development",
            "Database Design",
            "UI/UX Development",
            "Computer Science",
            "Full-Stack Development",
            "Frontend Development",
            "Backend Development",
            "Web Applications",
            "API Development",
            "Database Systems",
            "Cloud Computing",
            "DevOps",
            "Computer Vision",
            "Machine Learning",
            "Embedded Systems",
            "Systems Programming",

            "JavaScript",
            "TypeScript",
            "React",
            "Next.js",
            "OpenNext",
            "Node.js",
            "Python",
            "Java",
            "C",
            "C++",
            "C#",
            "Go",
            "Haskell",
            "Assembly",
            "PHP",

            "SQL",
            "MySQL",
            "SQLite",

            "HTML",
            "CSS",
            "LaTeX",

            "PyTorch",
            "OpenCV",
            "MediaPipe",
            "YOLO",

            "Linux",
            "Git",
            "Arduino",

            "Cloudflare Workers",
            "Cloudflare Pages",
            "Cloudflare D1",
            "Cloudflare R2",
            "AWS",
        ],
        knowsLanguage: [
            "English",
            "French",
        ],
        alumniOf: {
            "@type": "CollegeOrUniversity",
            name: "McMaster University",
        },
    };

    const session = await validateSession();

    return (
        <html lang="en">
            <body className={GeistMono.className}>
                <SmoothScroll/>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd),
                    }}
                />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(websiteJsonLd),
                    }}
                />            
                    
                <NotificationProvider>
                    <NavBar isLoggedIn={!!session} />
                    <main className="                
                        min-h-[90vh] 
                        flex 
                        flex-col 
                        justify-between
                        overflow-x-hidden
                    ">
                        {children}
                    </main>
                    
                    <Footer/>                    
                </NotificationProvider>
            </body>
        </html>
    );
}
