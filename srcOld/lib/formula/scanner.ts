import { SyntaxKind, Token, SyntaxKindBinary } from "./types";

const keywordsToKind: {
    [keyword: string]: SyntaxKindBinary
} = {
    mod: "mod keyword",
    div: "div keyword",
    to: "to keyword",
    in: "in keyword",
    and: "and keyword",
    or: "or keyword",
};

export function Scanner(str: string) {
    let pos = 0;
    let end = str.length;
    
    function isWhitespace(char: string) {
        return char === " " || char === "\n" || char === "\r" || char === "\t";
    }
    function scanWhitespace(): Token {
        const start = pos;
        while (pos < end && isWhitespace(str[pos])) {
            pos++;
        }
        const token: Token = {
            kind: "white space token",
            start,
            end: pos,
            text: str.slice(start, pos)
        };
        return token
    }
    function isDigit(char: string) {
        return char.length === 1 && "0123456789".indexOf(char) > -1;
    }

    function oneCharTokenToKind(char: string): SyntaxKind | undefined {
        return char === "("
            ? "open brace token"
            : char === ")"
                ? "close brace token"
                : char === "["
                    ? "open paren token"
                    : char === "]"
                        ? "close paren token"
                        : char === "/"
                            ? "slash token"
                            : char === "*"
                                ? "asterisk token"
                                : char === "+"
                                    ? "plus token"
                                    : char === "-"
                                        ? "minus token"
                                        : char === "="
                                            ? "equals token"
                                            : char === ";"
                                                ? "semicolon token"
                                                : undefined;
    }
    function lookAhead(charCount: number = 1) {
        return pos + charCount < end ? str[pos + charCount] : undefined;
    }

    function scanIdentifierOrKeyword(): Token | undefined {
        const start = pos;

        let text = '';
        let keywordKind :SyntaxKind | undefined = undefined;
        while (
            pos < end &&
            "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM01234567890_".indexOf(
                str[pos]
            ) > -1
        ) {
            pos++;
            text = str.slice(start, pos);
            keywordKind = text in keywordsToKind ? keywordsToKind[text as keyof typeof keywordsToKind] : undefined;
            if (keywordKind) {
                // Some quests have "[p1] mod1000" (without spaces)
                break
            }
        }
        
        const kind: SyntaxKind =
            keywordKind !== undefined ? keywordKind :
            "identifier";
        return {
            kind,
            start,
            end: pos,
            text
        };
    }

    function scanNumber() {
        let dotSeen = false;
        const start = pos;

        while (pos < end) {
            const char = str[pos];
            if (isDigit(char)) {
                // ok
            } else if (char === "." || char === ",") {
                if (dotSeen) {
                    break;
                }
                const nextNextChar = lookAhead();
                if (nextNextChar !== "." && nextNextChar !== ",") {
                    dotSeen = true;
                } else {
                    break;
                }
                // } else if (char === "-" && pos === start) {
                // Ok here
            } else {
                break;
            }

            pos++;
        }
        const token: Token= {
            kind: "numeric literal",
            start,
            end: pos,
            text: str.slice(start, pos)
        };
        return token;
    }

    function scan(): Token | undefined {
        if (pos >= end) {
            return undefined;
        }
        const char = str[pos];
        if (isWhitespace(char)) {
            return scanWhitespace();
        }

        const lookAheadChar = lookAhead();
        if (char === "." && lookAheadChar === ".") {
            const token: Token = {
                kind: "dotdot token",
                start: pos,
                end: pos + 2,
                text: char + lookAheadChar
            };
            pos += 2;
            return token;
        }

        if (char === "<" && lookAheadChar === ">") {
            const token: Token = {
                kind: "not equals token",
                start: pos,
                end: pos + 2,
                text: char + lookAheadChar
            };
            pos += 2;
            return token;
        }
        if (char === ">" && lookAheadChar === "=") {
            const token: Token = {
                kind: "greater than eq token",
                start: pos,
                end: pos + 2,
                text: char + lookAheadChar
            };
            pos += 2;
            return token;
        }
        if (char === "<" && lookAheadChar === "=") {
            const token: Token = {
                kind: "less than eq token",
                start: pos,
                end: pos + 2,
                text: char + lookAheadChar
            };
            pos += 2;
            return token;
        }

        if (char === ">" && lookAheadChar !== "=") {
            const token: Token = {
                kind: "greater than token",
                start: pos,
                end: pos + 1,
                text: char
            };
            pos++;
            return token;
        }

        if (char === "<" && lookAheadChar !== "=") {
            const token: Token = {
                kind: "less than token",
                start: pos,
                end: pos + 1,
                text: char
            };
            pos++;
            return token;
        }

        if (
            isDigit(char)
            // || (char === "-" && lookAheadChar && isDigit(lookAheadChar))
        ) {
            return scanNumber();
        }
        const oneCharKind = oneCharTokenToKind(char);
        if (oneCharKind !== undefined) {
            const token: Token = {
                kind: oneCharKind,
                start: pos,
                end: pos + 1,
                text: char
            };
            pos++;
            return token;
        }

        return scanIdentifierOrKeyword();
    }
    return scan;
}
