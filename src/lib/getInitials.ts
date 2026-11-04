export function getInitials(item: string) {
    const words = item
        .split(/[\s.+#-]+/)
        .filter(Boolean);

    // Prioritize 2 letter words
    const twoLetterWords = words.filter((word) => word.length === 2);

    if (twoLetterWords.length > 0) {
        return twoLetterWords.slice(0, 2).join("").toUpperCase();
    }

    // Capitalization e.g. DevOps -> DO
    const capitalized = words
        .map((word) => word.match(/[A-Z]/g)?.join(""))
        .filter(Boolean);

    const capitalCount = capitalized.join("").length;

    if (capitalCount > 0 && capitalCount < 3) {
        return capitalized.join("").toUpperCase();
    }

    // Fall back to first letters
    return null;
}