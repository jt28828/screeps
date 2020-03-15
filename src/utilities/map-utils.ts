export class MapUtils {
    public static mapToArray<TKey, TValue>(map: Map<TKey, TValue> | undefined): TValue[] {
        if (map === undefined) {
            return [];
        }
        return Array.from(map).map(([, value]) => value)
    }

    public static arrayToMap<TValue extends { id: string }>(array: TValue[]): Map<string, TValue> {
        return new Map(array.map(entry => [entry.id, entry]));
    }
}