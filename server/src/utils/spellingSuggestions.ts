import { spawnSync } from "child_process";
import log from "../log.js";

export const spellingSuggestions = (content: string): Record<string, string[]> => {
    const words = content.split(/\W/);
    const invalidWordsAndSuggestions: Record<string, string[]> = {};

    const allOutput = spawnSync("aspell", ["pipe"], {
        input: content,
        encoding: "utf-8"
    }).stdout.trim().split("\n");

    log.write({ allOutput })

    allOutput.forEach(line => {
        const prefix = line.slice(0, 1);

        switch (prefix) {
            case "&":
                // Handle good suggestions
                const suggestionMatch = line.match(/^& (.*?) \d.*: (.*)$/);
                if (!suggestionMatch) {
                    log.write({ spellingSuggestions: { invalidMatch: line } })
                    return;
                }
                invalidWordsAndSuggestions[suggestionMatch[1]] = suggestionMatch[2].split(", ");
                break;
            case "#":
                // Handle invalid
                const match = line.match(/^# (.*?) \d/);
                if (!match) {
                    log.write({ spellingSuggestions: { invalidMatch: line } })
                    return;
                }
                invalidWordsAndSuggestions[match[1]] = match[2].split(", ");
                break;
        }
    })


    return invalidWordsAndSuggestions
}