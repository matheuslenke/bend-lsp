import * as fs from "node:fs";
import { Diagnostic, DiagnosticSeverity, DocumentDiagnosticParams, FullDocumentDiagnosticReport, RequestMessage } from "vscode-languageserver";
import { documents } from "../../documents.js";
import log from "../../log.js";
import { hasMainFunction } from "./diagnostic/hasMainFunction.js";

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

    const items: Diagnostic[] = []
    const lines = content.split("\n")

    const mainFunctionDeclared = hasMainFunction(content)
    if (!mainFunctionDeclared) {
        items.push({
            source: "Bend",
            severity: DiagnosticSeverity.Error,
            range: {
                start: { line: 0, character: Number.MAX_VALUE },
                end: { line: Number.MAX_VALUE, character: 0 }
            },
            message: "No main() function declared",
            data: {
                type: "missing-main-function"
            }
        })
    }

    log.write({ hasMainFunction: mainFunctionDeclared })

    return {
        kind: "full",
        items
    }
}

