export class Result<T, E> {
    private constructor(
        private readonly state: { ok: true; value: T } | { ok: false; error: E }
    ) { }

    static ok<T>(value: T): Result<T, never> {
        return new Result<T, never>({ ok: true, value });
    }

    static err<E>(error: E): Result<never, E> {
        return new Result<never, E>({ ok: false, error });
    }

    static from<T, E>(
        fn: () => T,
        wrapErr: (error: unknown) => E
    ): Result<T, E> {
        try {
            return Result.ok(fn());
        } catch (error) {
            return Result.err(wrapErr(error));
        }
    }

    static async fromAsync<T, E>(
        fn: () => Promise<T>,
        wrapErr: (error: unknown) => E
    ): Promise<Result<T, E>> {
        try {
            const value = await fn();
            return Result.ok(value);
        } catch (error) {
            return Result.err(wrapErr(error));
        }
    }

    isOk(): this is Result<T, never> {
        return this.state.ok;
    }

    isErr(): this is Result<never, E> {
        return !this.state.ok;
    }

    /**
     * Returns the value if Ok, or undefined if Err.
     * This method should be used only after checking isOk() or isErr().
     */
    get value(): T | undefined {
        return this.state.ok ? this.state.value : undefined;
    }

    /**
     * Returns the error if Err, or undefined if Ok.
     * This method should be used only after checking isOk() or isErr().
     */
    get error(): E | undefined {
        return this.state.ok ? undefined : this.state.error;
    }

    map<U>(fn: (value: T) => U): Result<U, E> {
        if (this.state.ok) {
            return Result.ok(fn(this.state.value));
        } else {
            return Result.err(this.state.error);
        }
    }

    mapErr<F>(fn: (error: E) => F): Result<T, F> {
        if (this.state.ok) {
            return Result.ok(this.state.value);
        } else {
            return Result.err(fn(this.state.error));
        }
    }

    /**
     * In chaining multiple andThen calls, resulting `Result` instance will be of the
     * type of: Result<last Ok value type, union of all Err types>
     * 
     * @param fn    This function will be called if the Result is Ok, and it will create a new Result.
     * @returns     A new Result created by the function `fn` if the current Result is Ok, or the current Result if it is Err.
     */
    flatMap<U, F>(fn: (value: T) => Result<U, F>): Result<U, E | F> {
        if (this.state.ok) {
            return fn(this.state.value);
        } else {
            return Result.err(this.state.error);
        }
    }

    /**
     * andThen is same function as flatMap.
     * In chaining multiple andThen calls, resulting `Result` instance will be of the
     * type of: Result<last Ok value type, union of all Err types>
     * 
     * @param fn    This function will be called if the Result is Ok, and it will create a new Result.
     * @returns     A new Result created by the function `fn` if the current Result is Ok, or the current Result if it is Err.
     */
    andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, E | F> {
        return this.flatMap(fn);
    }

    /**
     * orElse is same as andThen but for the Err case
     * In chaining multiple orElse calls, resulting `Result` instance will be of the
     * type of: Result<union of all Ok value types, last Err value type>
     * 
     * @param fn    This function will be called if the Result is Err, and it will create a new Result.
     * @returns     A new Result created by the function `fn` if the current Result is Err, or the current Result if it is Ok.
     */
    orElse<U, F>(fn: (error: E) => Result<U, F>): Result<U | T, F> {
        if (this.state.ok) {
            return Result.ok(this.state.value);
        } else {
            return fn(this.state.error);
        }
    }

    /**
     * flatMapError is same as orElse
     * 
     * @param fn    This function will be called if the Result is Err, and it will create a new Result.
     * @returns     A new Result created by the function `fn` if the current Result is Err, or the current Result if it is Ok.
     */
    flatMapError<U, F>(fn: (error: E) => Result<U, F>): Result<U | T, F> {
        return this.orElse(fn);
    }

    match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
        if (this.state.ok) {
            return handlers.ok(this.state.value);
        } else {
            return handlers.err(this.state.error);
        }
    }

    getOrDefault<U>(defaultValue: U): U | T {
        if (this.state.ok) {
            return this.state.value;
        } else {
            return defaultValue;
        }
    }

    getOrElse<U>(defaultValueFactory: () => U): T | U {
        if (this.state.ok) {
            return this.state.value;
        } else {
            return defaultValueFactory();
        }
    }
}
