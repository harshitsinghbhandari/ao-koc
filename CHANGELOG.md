# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Initial setup with Agent Orchestrator as foundation
- Legal documentation: Populate LICENSE and align ATTRIBUTION.md and CHANGELOG.md

### Changed

### Deprecated

### Removed

### Fixed

### Security

---

## [0.1.0] - 2026-03-26

### Added
- Project initialized from Agent Orchestrator (Composio)
- ATTRIBUTION.md for proper licensing and credit
- CHANGELOG.md for tracking enhancements
- update-changelog skill for automated changelog management

### Foundation
- Built on [Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator) (MIT License)
- Inherits orchestration system for managing parallel AI coding agents
- Leverages core architecture for agent task decomposition and monitoring

---

## Notes for Contributors

### Updating the Changelog

When you add a new feature, fix, or enhancement:

1. Add your change to the **[Unreleased]** section under the appropriate heading
2. Use clear, user-facing language (not "fixed bug X", but "improve Y by doing Z")
3. If significant, link to the PR or commit hash for reference
4. Run the **update-changelog** skill when preparing a release

**Example entry:**
```markdown
### Added
- Enhanced agent coordination with priority-based task queuing ([PR #42](https://github.com/...))
- New plugin system for extensible agent behaviors
```

### Release Process

When ready to release:

1. Create a new version section (replace [TBD] with actual date)
2. Move items from **[Unreleased]** to the version section
3. Update version numbers in package.json, setup files, etc.
4. Commit with message: `release: v0.2.0`
5. Tag the release: `git tag v0.2.0`

### Keeping It Clean

- Keep the **[Unreleased]** section at the top
- Maintain reverse chronological order (newest at top)
- Use backticks for code references
- Link to issues/PRs when possible
- Group related changes together

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|-----------|
| 0.1.0 | 2026-03-26 | Foundation + initial setup |
| 0.0.0 | N/A | Base Agent Orchestrator |

---

**Last updated:** March 2026  
**Maintained by:** [Harshit Singh Bhandari]  
**Based on:** Agent Orchestrator by Composio (MIT License)