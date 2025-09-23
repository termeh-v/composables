import { describe, it, expect } from "vitest";
import { useConfig } from "../src/useConfig";

describe("useConfig", () => {
    const defaultConfig = {
        a: 1,
        b: {
            c: 2,
            d: [1, 2, 3],
            e: { f: 3 },
        },
        g: undefined,
    };

    it("returns a deep-cloned, reactive config", () => {
        const { config } = useConfig<typeof defaultConfig>(defaultConfig);
        expect(config).not.toBe(defaultConfig);
        expect(config).toMatchObject(defaultConfig);
    });

    it("replaces values by default (safe strategy)", () => {
        const { config, set } = useConfig<typeof defaultConfig>(defaultConfig);
        set({ a: 99 });
        expect(config.a).toBe(99);
        set({ a: undefined });
        expect(config.a).toBe(99);
        set({ b: { c: 5 } });
        expect(config.b.c).toBe(5);
        set({ b: { c: undefined } });
        expect(config.b.c).toBe(5);
        set({ b: { d: [9, 8] } });
        expect(config.b.d).toEqual([9, 8]);
    });

    it("deep merges objects with merge strategy", () => {
        const { config, set } = useConfig<typeof defaultConfig>(defaultConfig);
        set({ b: { e: { f: 10, x: 20 } as any } }, { "b.e": "merge" });
        expect(config.b.e.f).toBe(10);
        expect((config.b.e as any).x).toBe(20);
        expect(config.b.c).toBe(2);
    });

    it("ignores undefined with safe strategy", () => {
        const { config, set } = useConfig<typeof defaultConfig>(defaultConfig);
        set({ a: undefined }, { a: "safe" });
        expect(config.a).toBe(1);
        set({ b: { c: undefined } }, { "b.c": "safe" });
        expect(config.b.c).toBe(2);
    });

    it("replaces with undefined if not safe", () => {
        const { config, set } = useConfig<typeof defaultConfig>(defaultConfig);
        set({ a: undefined }, { a: "replace" });
        expect(config.a).toBe(undefined);
    });

    it("handles nested path strategies", () => {
        const { config, set } = useConfig<typeof defaultConfig>(defaultConfig);
        set({ b: { e: { f: 100 } } }, { "b.e.f": "replace" });
        expect(config.b.e.f).toBe(100);
    });

    it("does not mutate the original defaultConfig", () => {
        const { set } = useConfig<typeof defaultConfig>(defaultConfig);
        set({ a: 123, b: { c: 456 } });
        expect(defaultConfig.a).toBe(1);
        expect(defaultConfig.b.c).toBe(2);
    });
});
