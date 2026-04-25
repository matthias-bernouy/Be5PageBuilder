export function isValidPageTitle(s: string): boolean {
    if (typeof s !== "string") return false;
    
    const trimmed = s.trim();
    
    if (trimmed.length === 0) return false;
    if (trimmed.length > 70) return false;
    if (/[\x00-\x1F\x7F]/.test(trimmed)) return false;
    
    return true;
}

export function assertValidPageTitle(s: string): asserts s is string {
    if (typeof s !== "string") {
        throw new TypeError("Page title must be a string.");
    }
    
    const trimmed = s.trim();
    
    if (trimmed.length === 0) {
        throw new Error("Page title cannot be empty.");
    }
    if (trimmed.length > 70) {
        throw new Error(`Page title is too long (${trimmed.length} characters). Maximum allowed is 70.`);
    }
    if (/[\x00-\x1F\x7F]/.test(trimmed)) {
        throw new Error("Page title contains invalid control characters.");
    }
}