import * as fs from "node:fs";

const log = fs.createWriteStream("/tmp/lsp.log");

function write(message: object | unknown) {
    if (typeof message === "object") {
        log.write(JSON.stringify(message))
    } else {
        log.write(message)
    }
    log.write("\n")
}

export default {
    write: write
}