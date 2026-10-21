import { getDB } from "./db";

export async function getLinks() {
    const db = await getDB();

    const {results} = await db
        .prepare("SELECT * FROM links")
        .all();

    return results
}