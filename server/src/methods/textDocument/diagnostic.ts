import * as fs from "node:fs";
import { Diagnostic, DiagnosticSeverity, DocumentDiagnosticParams, FullDocumentDiagnosticReport, RequestMessage } from "vscode-languageserver";
import { documents } from "../../documents.js";
import log from "../../log.js";
import { spellingSuggestions } from "../../utils/spellingSuggestions.js";

const dictionaryWords = fs.readFileSync("/usr/share/dict/words").toString().split("\n");


export const diagnostic = (
    message: RequestMessage
): FullDocumentDiagnosticReport | null => {
    const params = message.params as DocumentDiagnosticParams;
    const content = documents.get(params.textDocument.uri);

    if (!content) {
        return null;
    }

    const wordsInDocument = content.split(/\W/);

    const invalidWords = new Set(
        wordsInDocument.filter((word => !dictionaryWords.includes(word)))
    )
    const items: Diagnostic[] = []
    const lines = content.split("\n")

    const invalidWordsAndSuggestions: Record<string, string[]> =
        spellingSuggestions(content);

    log.write({ spellingSuggestions: invalidWordsAndSuggestions })

    Object.keys(invalidWordsAndSuggestions).forEach(invalidWord => {
        const regex = new RegExp(`\\b${invalidWord}\\b`, "g");
        const wordSuggestions = invalidWordsAndSuggestions[invalidWord];

        const message = wordSuggestions.length ? `${invalidWord} isn't in our dictionary. Did you mean ${wordSuggestions.join(", ")}?` : `${invalidWord} isn't in our dictionary.`

        lines.forEach((line, lineNumber) => {
            let match
            while ((match = regex.exec(line)) !== null) {
                items.push({
                    source: "Bend LSP",
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: lineNumber, character: match.index },
                        end: {
                            line: lineNumber,
                            character: match.index + invalidWord.length
                        }
                    },
                    message: message,
                    data: {
                        invalidWord,
                        wordSuggestions,
                        type: "spelling-suggestion"
                    }
                })
            }
        })
    })
    return {
        kind: "full",
        items
    }
}
