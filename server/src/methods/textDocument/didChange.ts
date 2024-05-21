import { NotificationMessage } from "vscode-languageserver";
import { TextDocumentContentChangeEvent, VersionedTextDocumentIdentifier, documents } from "../../documents.js";

interface DidChangeDocumentParams {
    textDocument: VersionedTextDocumentIdentifier;
    contentChanges: TextDocumentContentChangeEvent[];
}

export const didChange = (message: NotificationMessage): void => {
    const params = message.params as DidChangeDocumentParams;

    documents.set(params.textDocument.uri, params.contentChanges[0].text);
}