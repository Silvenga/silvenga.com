import NodeCache from "node-cache";

const internalCache = new NodeCache();

export const ProcessCache = {
    createOrGet: <T>(key: string, valueFactory: () => T): T => {
        if (internalCache.has(key)) {
            return internalCache.get(key) as T;
        }
        const value = valueFactory();
        internalCache.set(key, value);
        return value;
    }
}
