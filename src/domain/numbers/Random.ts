export class RandomNumber {
    public randomInRange(min: number, max: number): number {
        if (min > max) [min, max] = [max, min];
        if (min === max) return min;

        const range = max - min;
        const raw = Math.random() * range + min;

        const result = Math.min(raw, max - 0.01);

        return +result.toFixed(2);
    }
}
