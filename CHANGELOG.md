# Changelog
All notable changes to this GitHub action will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Fixed
- Update Crowdin link.

## [0.9.0] - 2023-08-02
### Changed
- The default Docker image was changed to `ghcr.io/zaproxy/zaproxy:stable`.

## [0.8.2] - 2023-07-04
### Fixed
- Fix an issue introduced in the previous release that prevented the use of the default GitHub authentication token to raise issues.

## [0.8.1] - 2023-07-03
### Fixed
- Check issues with authenticated user. [#17](https://github.com/zaproxy/action-baseline/issues/17)

## [0.8.0] - 2023-06-30
### Added
 - An input (`artifact_name`) used to name the artifact that contains the ZAP reports. [#45](https://github.com/zaproxy/action-baseline/issues/45)

### Changed
- Run action with Node 16.
- Update dependencies.

## [0.7.0] - 2022-05-23
### Changed
- Update dependencies.

### Fixed
- Use default zap user rather than root to allow the Ajax Spider to run.

## [0.6.1] - 2021-10-08
### Changed
- Revert previous change (not into effect), no longer needed.

## [0.6.0] - 2021-10-08
### Changed
- Disabled the automation framework while we investigate a problem with it.

## [0.5.0] - 2021-09-14
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

[Unreleased]: https://github.com/zaproxy/action-baseline/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/zaproxy/action-baseline/compare/v0.8.2...v0.9.0
[0.8.2]: https://github.com/zaproxy/action-baseline/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/zaproxy/action-baseline/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/zaproxy/action-baseline/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/zaproxy/action-baseline/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/zaproxy/action-baseline/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/zaproxy/action-baseline/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/zaproxy/action-baseline/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/zaproxy/action-baseline/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/zaproxy/action-baseline/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/zaproxy/action-baseline/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/zaproxy/action-baseline/compare/64ea8c12229f3351fcc50f5834b2c8db25042817...v0.1.0
