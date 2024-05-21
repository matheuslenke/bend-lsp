import { NotificationMessage, RequestMessage } from "vscode-languageserver";
import log from "./log.js";
import { exit } from "./methods/exit.js";
import { initialize } from "./methods/initialize.js";
import { shutdown } from "./methods/shutdown.js";
import { codeAction } from "./methods/textDocument/codeAction.js";
import { completion } from "./methods/textDocument/completion.js";
import { diagnostic } from "./methods/textDocument/diagnostic.js";
import { didChange } from "./methods/textDocument/didChange.js";


type RequestMethod = (message: RequestMessage) =>
    ReturnType<typeof initialize>
    | ReturnType<typeof completion>
    | ReturnType<typeof diagnostic>
    | ReturnType<typeof codeAction>;

type NotificationMethod = (message: NotificationMessage) => void;

const methodLookup: Record<string, RequestMethod | NotificationMethod> = {
    initialize,
    shutdown,
    exit,
    "textDocument/completion": completion,
    "textDocument/didChange": didChange,
    "textDocument/diagnostic": diagnostic,
    "textDocument/codeAction": codeAction
}

const respond = (id: RequestMessage['id'], result: object | null) => {
    const message = JSON.stringify({ id, result })
    const messageLength = Buffer.byteLength(message, "utf8")
    const header = `Content-Length: ${messageLength}\r\n\r\n`

    log.write(header + message)
    process.stdout.write(header + message)
}

let buffer = "";
process.stdin.on("data", (chunk) => {
    buffer += chunk;

    while (true) {
        // Check for the Content-Length header
        const lengthMatch = buffer.match(/Content-Length: (\d+)\r\n/);
        if (!lengthMatch) break;

        const contentLength = parseInt(lengthMatch[1], 10);
        const messageStart = buffer.indexOf("\r\n\r\n") + 4;

        // Continue unless the full message is in the buffer
        if (buffer.length < messageStart + contentLength) break;

        const rawMessage = buffer.slice(messageStart, messageStart + contentLength);
        const message = JSON.parse(rawMessage) as RequestMessage;

        log.write({ id: message.id, method: message.method })

        const method = methodLookup[message.method]

        if (method) {
            const result = method(message);
            if (result !== undefined) {
                respond(message.id, result);
            }
        }

        // Remove the processed message from the buffer
        buffer = buffer.slice(messageStart + contentLength)
    }
})