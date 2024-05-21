import * as fs from "node:fs";
import { CompletionList, CompletionParams, RequestMessage } from "vscode-languageserver";
import { documents } from "../../documents.js";
import log from "../../log.js";
const MAX_LENGTH = 1000;

const words = fs.readFileSync("/usr/share/dict/words").toString().split("\n");

export const completion = (message: RequestMessage): CompletionList | null => {
    const params = message.params as CompletionParams
    const content = documents.get(params.textDocument.uri);

    if (!content) {
        return null;
    }
    const currentLine = content?.split("\n")[params.position.line];
    const lineUntilCursor = currentLine.slice(0, params.position.character);
    const currentWord = lineUntilCursor.replace(/.*\W(.*?)/, "$1");

    const items = words.filter(word => {
        return word.startsWith(currentWord);
    })
        .slice(0, MAX_LENGTH)
        .map(word => {
            return { label: word }
        })

    log.write({
        currentLine,
        lineUntilCursor,
        currentWord
    })

    return {
        isIncomplete: items.length === MAX_LENGTH,
        items
    }
}