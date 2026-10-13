import { getTags } from "@/lib/tags";
import CreateProjectPage from "./CreateProjectPage";
import { Tag } from "@/lib/types";
import { headers } from "next/headers";

export default async function Page() {

    const [tagOptions , statuses, headersList] = await Promise.all([
        getTags("project"),
        getTags("status"),
        headers(),
    ]);

    const referrer = headersList.get("referer")
        ? new URL(headersList.get("referer")!).pathname
        : null;

    return (
        <CreateProjectPage 
            tags={tagOptions as Tag[]} 
            statuses={statuses as Tag[]}
            referrer={referrer}
        />
    );
}