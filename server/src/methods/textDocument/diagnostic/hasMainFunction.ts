import log from "../../../log.js";

export const hasMainFunction = (content: string): boolean => {
    const functions = getAllFunctionDeclarations(content);

    return functions.includes("main")
};

export const getAllFunctionDeclarations = (content: string): string[] => {
    const functionDeclarationRegex = /def\s+\w+\s*\(\.*\)/g;
    const matches = content.match(functionDeclarationRegex);
    log.write({ matches })
    if (!matches) {
        return []
    }
    const functionNames: string[] = matches
        .filter(match => match !== null) // Filter out null values
        .flatMap(match => {
            return match.match(/\bdef\s+(\w+)\s*\(/) ?? []
        })
    return functionNames;
};