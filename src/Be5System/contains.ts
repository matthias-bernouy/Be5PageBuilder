export default function contains(o: any, key: string | string[]) {
    if (typeof key === "string") {
        // Use brackets to access the dynamic string value
        if (!(key in o)) {
            throw new Error(`There is no "${key}" parameter`);
        }
    } else {
        key.forEach((v) => {
            // v is the string from your array, e.g., "identifier"
            if (!(v in o)) {
                throw new Error(`There is no "${v}" parameter`);
            }
        });
    }
}