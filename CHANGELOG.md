# Changelog

All notable changes to this project are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning will follow [Semantic Versioning](https://semver.org/) once the first release is cut.

**Workflow:** when a task from [TODO.md](TODO.md) is finished, remove it from the TODO and add an entry below under `[Unreleased]` (keeping the task ID). On release, `[Unreleased]` is renamed to the version and date by the release process.

## [Unreleased]

### Added

- **PLAN-001** (2026-10-31) Analyzed the design handoff in `raw_files/design_handoff_erp_tecidos/`: 211 files — 58 components in 9 groups, CSS tokens (`colors`, `typography`, `spacing`, `fonts`, `base`) plus Tokens Studio `tokens.json`, 16 foundation cards, and written guidelines. ERP screens (`ERP.dc.html`, `support.js`) were intentionally left out of scope.
- **PLAN-002** (2026-10-31) Created [TODO.md](TODO.md): phased roadmap (setup and ADRs, foundation, architecture, component migration, testing, AI-ready foundation, docs, release), with task IDs, priorities, sizes and dependencies.
- **PLAN-003** (2026-10-31) Created [AGENTS.md](AGENTS.md): project rules for agents, decision status, design principles and content rules translated to English, visual foundations summary, accessibility requirements and keyboard contract, engineering conventions, testing strategy, Definition of Done and working procedure.
- **PLAN-004** (2026-10-31) Created this changelog and the TODO → CHANGELOG workflow.
- **PLAN-005** (2026-10-31) Audited the handoff and recorded findings in TODO Appendices A and B: measured WCAG contrast failures in tokens (`--text-3` on raised surfaces, `--line-strong` as control border, `--paper-accent`), spec-versus-code drift, hard-coded Portuguese strings, missing delivered files, and per-component accessibility defects.
