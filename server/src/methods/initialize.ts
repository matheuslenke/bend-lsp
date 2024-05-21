import { InitializeResult, RequestMessage } from "vscode-languageserver"

export const initialize = (message: RequestMessage): InitializeResult => {
    return {
        capabilities: {
            completionProvider: {},
            textDocumentSync: 1,
            diagnosticProvider: {
                interFileDependencies: false,
                workspaceDiagnostics: false,
            }
        },
        serverInfo: {
            name: "bend-lsp",
            version: "0.0.1"
        }
    }
}