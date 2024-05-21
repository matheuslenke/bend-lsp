import { CodeAction, CodeActionParams, RequestMessage } from "vscode-languageserver";

export const codeAction = (message: RequestMessage): CodeAction[] => {
    const params = message.params as CodeActionParams;
    const diagnostics = params.context.diagnostics;

    return diagnostics.flatMap((diagnostic): CodeAction[] => {
        const wordSuggestions: string[] = diagnostic.data.wordSuggestions;
        return wordSuggestions.map((wordSuggestion): CodeAction => {
            const codeAction: CodeAction = {
                title: `Replace with ${wordSuggestion}`,
                kind: "quickfix",
                edit: {
                    changes: {
                        [params.textDocument.uri]: [
                            {
                                range: diagnostic.range,
                                newText: wordSuggestion
                            }
                        ]
                    }
                }
            }
            return codeAction
        })
    })
}