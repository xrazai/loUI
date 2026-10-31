# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem. Use GitHub's private reporting: **Security > Report a vulnerability** on <https://github.com/xrazai/loUI/security/advisories/new>. If that is unavailable, contact the maintainer, [@xrazai](https://github.com/xrazai), through the email on their GitHub profile.

Include what you found, the affected component or file, and steps to reproduce. You can expect an acknowledgement within a few days and a fix or a decision as soon as practical. The package is pre-release (`0.0.0`, private), so only the latest `main` is supported.

## Scope

In scope: the `@loui/ds` library code, build and release scripts, GitHub workflows, and the published Storybook site. Typical concerns are XSS through component props, unsafe dependencies, and workflow permissions.

Out of scope: vulnerabilities in third-party dependencies with no exploitable path through Loui DS (report them upstream), and issues in your own application code.

## No telemetry

Loui DS collects no data. The library makes no network requests and sends no analytics. Storybook telemetry is disabled in `.storybook/main.ts` (`core.disableTelemetry`). To report a usage problem, open a GitHub issue; nothing is reported automatically.
