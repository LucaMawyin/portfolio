import { getDB } from "@/lib/db";
import { Experience, Session } from "@/lib/types";

export const getExperience = async(session : Session) => {
    const db = await getDB();

    const { results } = await db
        .prepare(`
            SELECT * 
            FROM experience
            ${!!session ? "" : "WHERE hidden = 0"}
            ORDER BY start_date DESC
        `)
        .all() as { results  : Experience[]}

        return results;        
};