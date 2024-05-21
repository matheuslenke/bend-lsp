import { afterEach, beforeEach, describe, expect, test } from "vitest";

import type {
    CompletionList,
    FullDocumentDiagnosticReport
} from "vscode-languageserver";

import { LanguageServerWrapper } from "./language-server-wrapper.js";

let languageServer: LanguageServerWrapper;

const defaultFile = "file:///home/user/project/file.txt";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const init = async () => {
    await languageServer.request("initialize", {
        rootUri: "file:///home/user/project",
        capabilities: {},
    });
};

const documentVersion = new Map<string, number>();

const didChange = (text: string, uri: string = defaultFile) => {
    const version = documentVersion.get(uri) ?? 1;

    languageServer.notify("textDocument/didChange", {
        textDocument: { uri, version },
        contentChanges: [{ text: text }],
    });

    documentVersion.set(uri, version + 1);
};

const completionRequest = async (
    position: { line: number; character: number },
    uri: string = defaultFile,
) => {
    return (await languageServer.request("textDocument/completion", {
        textDocument: { uri },
        position,
    })) as unknown as CompletionList;
};

describe("Bend LSP", () => {
    beforeEach(() => {
        languageServer = new LanguageServerWrapper(
            "npm",
            ["run", "run"],
            !!process.env.VERBOSE,
        );
        try {
            languageServer.start();
        } catch (err) {
            console.log(err)
        }
    });

    afterEach(() => {
        languageServer.stop();
    });

    test("can shutdown and exit", async () => {
        await init();
        const response = await languageServer.request("shutdown", {});
        expect(response).toBeNull();
        await wait(20);
        expect(languageServer.process?.exitCode).toBeNull();

        languageServer.notify("exit", {});
        await wait(20);
        expect(languageServer.process?.exitCode).toBe(0);
    });

    test("require main function declared", async () => {
        await init();
        const code: string = `
            def main2():
                return 0;
        `;
        didChange(code);

        const diagnostics = (await languageServer.request(
            "textDocument/diagnostic",
            {
                textDocument: { uri: defaultFile },
            },
        )) as FullDocumentDiagnosticReport;

        expect(diagnostics).toStrictEqual({
            kind: "full",
            items: [
                {
                    source: "Bend",
                    severity: 1,
                    range: {
                        start: { line: 0, character: Number.MAX_VALUE },
                        end: { line: Number.MAX_VALUE, character: 0 },
                    },
                    message:
                        "No main() function declared",
                    data: {
                        type: "missing-main-function"
                    }
                },
            ],
        });
    });
});