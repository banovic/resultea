# resultea
Small, dependency-free Result type for TypeScript.

## Motivation
I built this as a small, complete project while learning TypeScript.

After working in Rust, I missed having a Result type for error handling, with errors visible in the type signature and checked by the compiler.

Encoding success and failure directly in the return signature is more explicit and has lower cognitive overhead - it reads simpler and easier than the alternatives, and building one was a fun TypeScript exercise.

If you need a production-grade Result with the full combinator toolkit, use [neverthrow](https://github.com/supermacro/neverthrow) or [fp-ts](https://github.com/gcanti/fp-ts).
