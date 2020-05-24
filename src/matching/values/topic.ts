export class Topic {
    public readonly title: string;

    constructor(title: string) {
        this.title = title;
    }

    /**
     * Determines if a topic is equal to the suspect.
     * @param suspect any
     */

    public equals(suspect: any): boolean {
        if (suspect instanceof Topic) {
            const other = suspect as Topic;
            return this.title == other.title;
        }
        return false;
    }
}
