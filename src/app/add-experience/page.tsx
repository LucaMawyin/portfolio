import { getTags } from "@/lib/tags";
import { Tag } from "@/lib/types";
import CreateExperiencePage from "./CreateExperiencePage";
import { headers } from "next/headers";

export default async function Page() {

    const [tagOptions , statusOptions, headersList] = await Promise.all([
        getTags("experience"),
        getTags("exp_status"),
        headers(),
    ]);

    const referrer = headersList.get("referer")
        ? new URL(headersList.get("referer")!).pathname
        : null;

    return (
        <CreateExperiencePage 
            statuses={statusOptions as Tag[]}
            tags={tagOptions as Tag[]} 
            referrer={referrer}
        />
    );
}