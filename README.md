## resultea
Small, dependency-free Result type for TypeScript.

## Motivation
I built this as a small, complete project while learning TypeScript. It is not meant for production use - there are more mature and complete Result implementations available.

15+ years of PHP and JavaScript error-handling conventions (exceptions, union and nullable return types, ad-hoc success/error objects, some special type values interpreted as errors etc.) convinced me the Result type was worth understanding from the inside out.
Encoding success and failure directly in the return signature is more explicit and has lower cognitive overhead, and reads simpler and easier than the alternatives, and building one was the clearest way to see why.
