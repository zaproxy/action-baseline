# Action Baseline

A GitHub Action for running the OWASP ZAP [Baseline scan](https://github.com/zaproxy/zaproxy/wiki/ZAP-Baseline-Scan). 

The ZAP baseline action scans a target URL for vulnerabilities and maintains an issue in GitHub repository for the
identified alerts.


## Inputs

### `Github token`

**Required** ZAP action uses the default action token provided by GitHub to create and update the issue for the baseline scan.

### `target`

**Required** The URL of the web application to be scanned. This can be either a publicly available web application or a locally
accessible URL.

### `docker_name`

**Optional** The name of the docker file to be executed. By default the action runs the stable version of ZAP. But you can 
configure the parameter to use the weekly builds.

### `rules_file_name`

**Optional** You can also specify a relative path to the rules file to ignore any alerts from the ZAP scan. Make sure to create
the rules file inside the relevant repository. The following shows a sample rules file configuration.

```tsv
10011	IGNORE	(Cookie Without Secure Flag)
10015	IGNORE	(Incomplete or No Cache-control and Pragma HTTP Header Set)
``` 

### `cmd_options`

**Optional** Additional command lines options for the baseline script

## Example usage

** Basic **
```
steps:
  - name: ZAP Scan
    uses: zaproxy/action-baseline@v0.2.0
    with:
      token: ${{ secrets.GIT_TOKEN }}
      target: 'https://www.zaproxy.org/'
```

** Advanced **

```
on: [push]

jobs:
  zap_scan:
    runs-on: ubuntu-latest
    name: Scan the webapplication
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          ref: master
      - name: ZAP Scan
        uses: zaproxy/action-baseline@v0.2.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          docker_name: 'owasp/zap2docker-stable'
          target: 'https://www.example.com'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
```

## Additional Information

The following [issue](https://github.com/zaproxy/zaproxy-website/issues/93) shows how the GitHub Baseline Action scans the 
[https://www.zaproxy.org/](https://www.zaproxy.org/) website and notifies the users via opening an issue in the ZAP website repository. 
The issue will be created by the GitHub Actions bot and will list the alerts as issue comments.

[![zap-issue](./images/zap-issue-1.png)](https://github.com/zaproxy/zaproxy-website/issues/93#issue-597219582)

To demonstrate the workflow of the action; we are ignoring the alerts as they are not relevant, but this has the same effect as fixing them.
Therefore during the second scan we are ignoring few alerts via ZAP rules and the action bot updates the issue with the newly ignored/resolved alerts. 
[![zap-issue](./images/zap-issue-2.png)](https://github.com/zaproxy/zaproxy-website/issues/93#issuecomment-611490632)


During the last scan we are ignoring all the alerts, thus resulting in finding zero vulnerabilities. Based on the scan results 
the actions bot will close the ongoing open issue.
[![zap-issue](./images/zap-issue-3.png)](https://github.com/zaproxy/zaproxy-website/issues/93#issuecomment-611496321)
