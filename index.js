const core = require('@actions/core');
const exec = require('@actions/exec');
const common = require('@zaproxy/actions-common-scans');
const _ = require('lodash');

// Default file names
let jsonReportName = 'report.json';
let mdReportName = 'report.md';
let htmlReportName = 'report.html';
let xmlReportName = 'report.xml'

async function run() {

    try {
        let workspace = process.env.GITHUB_WORKSPACE;
        let currentRunnerID = process.env.GITHUB_RUN_ID;
        let repoName = process.env.GITHUB_REPOSITORY;
        let token = core.getInput('token');
        let docker_name = core.getInput('docker_name');
        let target = core.getInput('target');
        let rulesFileLocation = core.getInput('rules_file_name');
        let cmdOptions = core.getInput('cmd_options');
        let issueTitle = core.getInput('issue_title');
        let failAction = core.getInput('fail_action');
        let allowIssueWriting = core.getInput('allow_issue_writing');
        let artifactName = core.getInput('artifact_name');
        let createIssue = true;

        if (!(String(failAction).toLowerCase() === 'true' || String(failAction).toLowerCase() === 'false')) {
            console.log('[WARNING]: \'fail_action\' action input should be either \'true\' or \'false\'');
        }

        if (String(allowIssueWriting).toLowerCase() === 'false') {
            createIssue = false;
        }

        if (!artifactName) {
            console.log('[WARNING]: \'artifact_name\' action input should not be empty. Setting it back to the default name.');
            artifactName = 'zap_scan';
        }

        console.log('starting the program');
        console.log('github run id :' + currentRunnerID);

        let plugins = [];
        if (rulesFileLocation) {
            plugins = await common.helper.processLineByLine(`${workspace}/${rulesFileLocation}`);
        }

        // Allow writing files from the Docker container.
        await exec.exec(`chmod a+w ${workspace}`);

        await exec.exec(`docker pull ${docker_name} -q`);
        let command = (`docker run -v ${workspace}:/zap/wrk/:rw --network="host" -e ZAP_AUTH_HEADER -e ZAP_AUTH_HEADER_VALUE -e ZAP_AUTH_HEADER_SITE ` +
            `-t ${docker_name} zap-baseline.py -t ${target} -J ${jsonReportName} -w ${mdReportName}  -r ${htmlReportName} -x ${xmlReportName} ${cmdOptions}`);

        if (plugins.length !== 0) {
            command = command + ` -c ${rulesFileLocation}`
        }

        try {
            await exec.exec(command);
        } catch (err) {
            if (err.toString().includes('exit code 3')) {
                core.setFailed('failed to scan the target: ' + err.toString());
                return
            }

            if ((err.toString().includes('exit code 2') || err.toString().includes('exit code 1'))
                    && String(failAction).toLowerCase() === 'true') {
                console.log(`[info] By default ZAP Docker container will fail if it identifies any alerts during the scan!`);
                core.setFailed('Scan action failed as ZAP has identified alerts, starting to analyze the results. ' + err.toString());
            }else {
                console.log('Scanning process completed, starting to analyze the results!')
            }
        }
        await common.main.processReport(token, workspace, plugins, currentRunnerID, issueTitle, repoName, createIssue, artifactName);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
