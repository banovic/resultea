import { Result } from "../src/result.js";
import { describe, it, expect, expectTypeOf } from 'vitest';

describe('Result', () => {
    const defaultErrorWrapper = (error: unknown): Error => {
        return error instanceof Error ? error : new Error(String(error));
    };

    const randomResult = <A, B>(a: A, b: B): Result<A, B> => Math.random() > 0.5 ? Result.ok(a) : Result.err(b);

    describe('ok()', () => {
        it('is a static factory method that creates Result<T, never> which represents success', () => {
            const result = Result.ok(123);
            expect(result.isOk()).toBe(true);
            expect(result.isErr()).toBe(false);
            expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
        });
    });

    describe('err()', () => {
        it('is a static factory method that creates Result<never, E> which represents not-success', () => {
            const result = Result.err('error occurred');
            expect(result.isOk()).toBe(false);
            expect(result.isErr()).toBe(true);
            expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
        });
    });

    describe('from()', () => {
        it('is a static factory method that creates Result<T, E> by running function in try/catch block', () => {
            const result = Result.from(() => 42, defaultErrorWrapper);
            expect(result.isOk()).toBe(true);
            expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
        });

        it('requires error wrapper function to convert unknown thrown error into E type', () => {
            const result = Result.from(() => { throw new Error('error'); }, defaultErrorWrapper);
            expect(result.isErr()).toBe(true);
            expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
        });

        it('error wrapper is called with the thrown error and has type: (error: unknown) => E', () => {
            const customWrapper = (error: unknown): string => {
                return 'Error happened while executing function';
            };
            const result = Result.from(() => { throw new Error('error'); }, customWrapper);
            expect(result.isErr()).toBe(true);
            expect(result.error).toBe('Error happened while executing function');
            expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
        });
    });

    describe('fromAsync()', () => {
        it('creates Result<T, E> from async function that is run in try/catch block', async () => {
            const result = await Result.fromAsync(async () => 42, defaultErrorWrapper);
            expect(result.isOk()).toBe(true);
            expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
        });

        it('requires error wrapper function to convert unknown thrown error into E type', async () => {
            const result = await Result.fromAsync(async () => { throw new Error('async error'); }, defaultErrorWrapper);
            expect(result.isErr()).toBe(true);
            expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
        });

        it('error wrapper is called with the thrown error and has type: (error: unknown) => E', async () => {
            const result = await Result.fromAsync(async () => { throw new Error('async error'); }, defaultErrorWrapper);
            expect(result.isErr()).toBe(true);
            expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
        });
    });

    describe('isOk() and isErr()', () => {
        it('isOk() returns true when called on success result', () => {
            const result = Result.ok(42);
            expect(result.isOk()).toBe(true);
        });

        it('isErr() returns true when called on non-success result', () => {
            const result = Result.err('failure');
            expect(result.isErr()).toBe(true);
        });
    });

    describe('get value()', () => {
        it('returns the value when called on success result', () => {
            const result = Result.ok(42);
            expect(result.isOk()).toBe(true);
            expect(result.value).toBe(42);
        });

        it('returns undefined when called on success result with undefined value', () => {
            const result = Result.ok(undefined);
            expect(result.isOk()).toBe(true);
            expect(result.value).toBeUndefined();
        });

        it('returns undefined when called on non-success result', () => {
            const result = Result.err('failure');
            expect(result.value).toBeUndefined();
        });

        it('should *not* be used as a test whether Result is success or not', () => {
            const result1 = Result.err('failure');
            const result2 = Result.ok(undefined);
            expect(result1.value === result2.value).toBe(true);
            expect(result1.isErr()).toBe(true);
            expect(result2.isOk()).toBe(true);
        });

        it('should be used in pragmatic way after isOk() check', () => {
            const result = Result.ok(undefined);
            if (result.isOk()) {
                expect(result.value).toBeUndefined();
            }
        });
    });

    describe('get error()', () => {
        it('returns the error when called on Err result', () => {
            const result = Result.err('failure');
            expect(result.isErr()).toBe(true);
            expect(result.error).toBe('failure');
        });

        it('returns undefined when called on Err result with undefined error', () => {
            const result = Result.err(undefined);
            expect(result.isErr()).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('returns undefined when called on Ok result', () => {
            const result = Result.ok(42);
            expect(result.isOk()).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should *not* be used as a test whether Result is Err or Ok', () => {
            const result1 = Result.ok(42);
            const result2 = Result.err(undefined);
            expect(result1.error === result2.error).toBe(true);
            expect(result1.isOk()).toBe(true);
            expect(result2.isErr()).toBe(true);
        });

        it('should be used in pragmatic way after isErr() check', () => {
            const result = Result.err(undefined);
            if (result.isErr()) {
                expect(result.error).toBeUndefined();
            }
        });
    });

    describe('map()', () => {
        it('transforms the value inside success Result into new Result', () => {
            const orig = Result.ok(2);
            const result = orig.map(x => x * 3);
            expect(result.isOk()).toBe(true);
            expect(result.value).toBe(6);
            expectTypeOf(orig).toEqualTypeOf<Result<number, never>>();
            expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
        });

        it('can change success value type, Result<T, E> -> Result<U, E>', () => {
            const orig = Result.ok(10);
            expectTypeOf(orig).toEqualTypeOf<Result<number, never>>();
            const mapped = orig.map(n => `Number is ${n}`);
            expectTypeOf(mapped).toEqualTypeOf<Result<string, never>>();
        });

        it('preserves error type, Result<T, E> -> Result<U, E>', () => {
            const orig = Result.ok(10);
            expectTypeOf(orig).toEqualTypeOf<Result<number, never>>();
            const mapped = orig.map(n => `Number is ${n}`);
            expectTypeOf(mapped).toEqualTypeOf<Result<string, never>>();
        });
    });

    describe('mapErr()', () => {
        it('mapErr() transforms the error inside non-success Result', () => {
            const orig = Result.err('failure');
            expectTypeOf(orig).toEqualTypeOf<Result<never, string>>();
            const mapped = orig.mapErr(err => new Error(`Error: ${err}`));
            expectTypeOf(mapped).toEqualTypeOf<Result<never, Error>>();
            expect(mapped.isErr()).toBe(true);
        });

        it('can change error type, Result<T, E> -> Result<T, F>', () => {
            const orig = Result.err('failure');
            expectTypeOf(orig).toEqualTypeOf<Result<never, string>>();
            const mapped = orig.mapErr(err => new Error(`Error: ${err}`));
            expectTypeOf(mapped).toEqualTypeOf<Result<never, Error>>();
        });

        it('preserves success value type, Result<T, E> -> Result<T, F>', () => {
            const orig = Result.ok(42);
            const mapped2 = orig.mapErr(err => new Error(`Error: ${err}`));
            expectTypeOf(orig).toEqualTypeOf<Result<number, never>>();
            expectTypeOf(mapped2).toEqualTypeOf<Result<number, Error>>();
        });
    });

    describe('flatMap()', () => {
        it('transforms the value inside success Result into another success Result', () => {
            const orig = Result.ok(2);
            const fmapped = orig.flatMap(x => Result.ok(x * 4));
            expectTypeOf(fmapped).toEqualTypeOf<Result<number, never>>();
            expect(fmapped.isOk()).toBe(true);
            expect(fmapped.value).toBe(8);
        });

        it('accumulates all error types in union for non-success Results', () => {
            const result = Result.ok(123)
                .flatMap(x => Result.ok(x * 4))
                .flatMap(x => Result.err('failure'))
                .flatMap(x => Result.err(10))
                .flatMap(x => Result.ok(x + 5));
            expectTypeOf(result).toEqualTypeOf<Result<number, string | number>>();
            expect(result.isErr()).toBe(true);
            expect(result.error).toBe('failure');
        });

        it('allows Result chaining', () => {
            const result = Result.ok(3)
                .flatMap(x => Result.ok(`x + ${x + 2}`))
                .flatMap(x => Result.ok(x + x));
            expect(result.isOk()).toBe(true);
            expect(result.value).toBe('x + 5x + 5');
            expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
        });

        it('short-circuits on first non-success Result', () => {
            const result = Result.ok(3)
                .flatMap(x => Result.err('first failure'))
                .flatMap(x => Result.ok(x * 5));
            expect(result.isErr()).toBe(true);
            expect(result.error).toBe('first failure');
            expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
        });

        it('has typing of chained calls: Result<last success type, union of all error types>', () => {
            const result = Result.ok(3)
                .flatMap(x => x === 1 ? Result.err('first failure') : Result.ok(x * 5))
                .flatMap(x => Result.ok(x + 2))
                .flatMap(x => Result.err(new Error('second failure')))
                .flatMap(x => Result.ok(`Number is ${x}`));
            expectTypeOf(result).toEqualTypeOf<Result<string, Error | string>>();
        });
    });

    describe('orElse()', () => {
        it('has typing of chained calls: Result<union of all success types, last error type>', () => {
            const result = randomResult(10, 'error A')
                .orElse(err => randomResult('recovered', new Error('error B')))
                .orElse(err => randomResult(true, 42));
            expectTypeOf(result).toEqualTypeOf<Result<number | string | boolean, number>>();
        });

        it('short-circuits on first success Result', () => {
            const result = Result.ok(3)
                .orElse(err => Result.ok('recovered'));
            expectTypeOf(result).toEqualTypeOf<Result<number | string, never>>();
            expect(result.isOk()).toBe(true);
            expect(result.value).toBe(3);
        });

        it('allows chaining multiple orElse calls', () => {
            const result4 = Result.err('initial failure')
                .orElse(err => randomResult(10, 'middle failure'))
                .orElse(err => Result.err('some other failure'));
            expectTypeOf(result4).toEqualTypeOf<Result<number, string>>();
        });
    });

    describe('match()', () => {
        it('transforms Result if it is success or not-success', () => {
            // match() on Ok
            const result = Result.ok(3);
            const matchResult = result.match({
                ok: value => `Success: ${value}`,
                err: error => `Error: ${error}`,
            });
            expect(matchResult).toBe('Success: 3');

            // match() on Err
            const errorResult = Result.err('failure');
            const matchErrorResult = errorResult.match({
                ok: value => `Success: ${value}`,
                err: error => `Error: ${error}`,
            });
            expect(matchErrorResult).toBe('Error: failure');
        });

        it('can handle differnt types for success and non-success as union, but it has to be explicitly typed', () => {
            // union case
            const okResult = Result.ok(3);
            const matchOkResult = okResult.match<string | number>({
                ok: value => `Success: ${value}`,
                err: error => 123,
            });
            expect(matchOkResult).toBe('Success: 3');
            expectTypeOf(matchOkResult).toEqualTypeOf<string | number>();
        });
    });

    describe('getOrDefault()', () => {
        it('provides default value for success Result - does nothing', () => {
            const result1 = Result.ok(42);
            expect(result1.getOrDefault(0)).toBe(42);

            const result2 = Result.ok(42);
            expect(result2.getOrDefault('foo')).toBe(42);
        });

        it('provides default value for non-success Result', () => {
            const result3 = Result.err('failure');
            expect(result3.getOrDefault(0)).toBe(0);

            const result4 = Result.err('failure');
            expect(result4.getOrDefault('foo')).toBe('foo');
        });
    });

    describe('getOrElse()', () => {
        it('provides default value for success Result - does nothing', () => {
            const result1 = Result.ok(42);
            expect(result1.getOrElse(() => 0)).toBe(42);

            const result2 = Result.ok(42);
            expect(result2.getOrElse(() => 'foo')).toBe(42);
        });

        it('provides default value for non-success Result', () => {
            const result3 = Result.err('failure');
            expect(result3.getOrElse(() => 0)).toBe(0);

            const result4 = Result.err('failure');
            expect(result4.getOrElse(() => 'foo')).toBe('foo');
        });
    });
});