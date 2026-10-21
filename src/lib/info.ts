export const pages = [
    {title:"home", href:"/", requireLogin : false, mobile : true, show: true },
    { title:"about", href:"/", section : "about", requireLogin : false, show: true },
    { title: "projects", href:"/", section : "projects", requireLogin : false, show: true },
    { title: "tech i use", href:"/", section : "tech", requireLogin : false, show: true },
    { title:"experience", href:"/", section : "experience", requireLogin : false, show: true },
    { title: "resume", href:"/resume", requireLogin : false, newTab : true, show: true },
    { title: "settings", href:"/settings", requireLogin : true, show: true },
    { title: "logout", href: "/logout", requireLogin : true, show: true },
    { title: "edit-tech", href: "/edit-tech", requireLogin : true, show: false },
    { title: "add-project", href: "/add-project", requireLogin : true, show: false },
]

export const getIcon = (href: string) => {
    try {
        if (href.toLowerCase().startsWith("mailto:")) {
            return "lucide:mail";
        }

        const url = new URL(
            /^[a-z][a-z\d+.-]*:/i.test(href)
                ? href
                : `https://${href}`
        );

        const hostname = url.hostname
            .toLowerCase()
            .replace(/^www\./, "");

        if (hostname === "linkedin.com") {
            return "fa6-brands:linkedin-in";
        }

        const parts = hostname.split(".");
        const domain =
            parts.length >= 2
                ? parts[parts.length - 2]
                : parts[0];

        return `simple-icons:${domain}`;
    } catch {
        return "lucide:globe";
    }
};