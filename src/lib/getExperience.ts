import { getDB } from "@/lib/db";
import { Experience, Session } from "@/lib/types";

export const getExperience = async (session: Session) => {
    const db = await getDB();

    const { results } = await db
        .prepare(`
            SELECT
                e.*,
                t.colour AS status_colour
            FROM experience e
            LEFT JOIN tags t
                ON t.name = e.status
                AND t.category = 'exp_status'
            ${!session ? "WHERE e.hidden = 0" : ""}
            ORDER BY e.start_date DESC
        `)
        .all() as { results: Experience[] };

    return results;
};