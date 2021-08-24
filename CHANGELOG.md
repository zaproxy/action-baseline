# Changelog
All notable changes to this GitHub action will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
 - An input (`allow_issue_writing`) to choose if a GitHub issue should be raised or not. [#56](https://github.com/zaproxy/action-baseline/issues/56)

### Changed
- Update dependencies.

## [0.4.0] - 2020-10-08
### Added
- Option to fail the status of the GitHub action if any alerts are found during the scan process. [#31](https://github.com/zaproxy/action-baseline/issues/31)

### Changed
- Modified the action status to pass by default (previously fail by default) [#31](https://github.com/zaproxy/action-baseline/issues/31)
- Reduced docker logs [#20](https://github.com/zaproxy/action-baseline/issues/20)

## [0.3.0] - 2020-04-28
### Added
- Allow to configure the title of the issue raised, using the parameter `issue_title`. [#10](https://github.com/zaproxy/action-baseline/issues/10)

### Changed
- Moved the common code to [actions-common-scans repository](https://github.com/zaproxy/actions-common)

## [0.2.0] - 2020-04-09
### Added
- Allow to pass command line arguments to the baseline script, using the parameter `cmd_options`. [#4](https://github.com/zaproxy/action-baseline/issues/4)

### Changed
- Improve the content of the issue raised and generate the HTML report. [#3](https://github.com/zaproxy/action-baseline/issues/3)

## [0.1.0] - 2020-04-07

First release to Marketplace.

[Unreleased]: https://github.com/zaproxy/action-baseline/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/zaproxy/action-baseline/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/zaproxy/action-baseline/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/zaproxy/action-baseline/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/zaproxy/action-baseline/compare/64ea8c12229f3351fcc50f5834b2c8db25042817...v0.1.0
