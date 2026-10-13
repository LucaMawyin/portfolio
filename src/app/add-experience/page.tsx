import { getTags } from "@/lib/tags";
import { Tag } from "@/lib/types";
import CreateExperiencePage from "./CreateExperiencePage";
import { headers } from "next/headers";

export default async function Page() {

    const [tagOptions , headersList] = await Promise.all([
        getTags("experience"),
        headers(),
    ]);

    const referrer = headersList.get("referer")
        ? new URL(headersList.get("referer")!).pathname
        : null;

    return (
        <CreateExperiencePage 
            tags={tagOptions as Tag[]} 
            referrer={referrer}
        />
    );
}