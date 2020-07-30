export function removeItem<T>(item: T, array: T[]) {
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
}
