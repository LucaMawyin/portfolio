import { SocialLink } from "@/lib/types";

export default function Footer(props : {links: SocialLink[]}){
    return (
        <footer className="w-full py-4 flex flex-col items-center gap-3 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Luca Mawyin</p>

            <div className="flex flex-wrap justify-center gap-4">
                {props.links.map((link) => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {link.title}
                    </a>
                ))}

                
                <a
                    href="/resume"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Resume
                </a>
            
            </div>
        </footer>
    );
}