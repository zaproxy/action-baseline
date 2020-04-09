const fs = require('fs');
const _ = require('lodash');
const readline = require('readline');
const AdmZip = require('adm-zip');
const request = require('request');
const artifact = require('@actions/artifact');

function createReadStreamSafe(filename, options) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filename, options);
        fileStream.on('error', reject).on('open', () => {
            resolve(fileStream);
        });
    });
}

let actionHelper = {

    getRunnerID: ((body) => {
        let results = body.match('RunnerID:\\d+');
        if (results !== null && results.length !== 0) {
            return results[0].split(':')[1];
        }
        return null;
    }),

    processLineByLine: (async (tsvFile) => {
        let plugins = [];
        try {
            const fileStream = await createReadStreamSafe(tsvFile);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            for await (const line of rl) {
                if (line.charAt(0) !== '#') {
                    let tmp = line.split('\t');
                    if (tmp[0].trim() !== '' && tmp[1].trim().toUpperCase() === 'IGNORE') {
                        plugins.push(tmp[0].trim());
                    }
                }
            }
        } catch (err) {
            console.log(`Error when reading the rules file: ${tsvFile}`)
        }

        return plugins;
    }),

    createMessage: ((sites, runnerID, runnerLink) => {
        const NXT_LINE = '\n';
        const TAB = "\t";
        const BULLET = "-";
        let msg = '';
        let instanceCount = 5;

        sites.forEach((site => {
            msg = msg + `${BULLET} Site: [${site["@name"]}](${site["@name"]}) ${NXT_LINE}`;
            if (site.hasOwnProperty('alerts')) {
                if (site.alerts.length !== 0) {
                    msg = `${msg} ${TAB} **New Alerts** ${NXT_LINE}`;
                    site.alerts.forEach((alert) => {
                        msg = msg + TAB + `${BULLET} **${alert.name}** [${alert.pluginid}] total: ${alert.instances.length}:  ${NXT_LINE}`

                        for (let i = 0; i < alert['instances'].length; i++) {
                            if (i >= instanceCount) {
                                msg = msg + TAB + TAB + `${BULLET} .. ${NXT_LINE}`;
                                break
                            }
                            let instance = alert['instances'][i];
                            msg = msg + TAB + TAB + `${BULLET} [${instance.uri}](${instance.uri}) ${NXT_LINE}`;
                        }
                    });
                    msg = msg + NXT_LINE
                }
            }

            if (site.hasOwnProperty('removedAlerts')) {
                if (site.removedAlerts.length !== 0) {
                    msg = `${msg} ${TAB} **Resolved Alerts** ${NXT_LINE}`;
                    site.removedAlerts.forEach((alert) => {
                        msg = msg + TAB + `${BULLET} **${alert.name}** [${alert.pluginid}] total: ${alert.instances.length}:  ${NXT_LINE}`
                    });
                    msg = msg + NXT_LINE
                }
            }

            if (site.hasOwnProperty('ignoredAlerts')) {
                if (site.ignoredAlerts.length !== 0) {
                    msg = `${msg} ${TAB} **Ignored Alerts** ${NXT_LINE}`;
                    site.ignoredAlerts.forEach((alert) => {
                        msg = msg + TAB + `${BULLET} **${alert.name}** [${alert.pluginid}] total: ${alert.instances.length}:  ${NXT_LINE}`
                    });
                    msg = msg + NXT_LINE
                }
            }

            msg = msg + NXT_LINE
        }));
        if (msg.trim() !== '') {
            msg = msg + NXT_LINE + runnerLink;
            msg = msg + NXT_LINE + runnerID;
        }
        return msg
    }),

    generateDifference: ((newReport, oldReport) => {
        newReport.updated = false;
        let siteClone = [];
        newReport.site.forEach((newReportSite) => {
            // Check if the new report site already exists in the previous report
            let previousSite = _.filter(oldReport.site, s => s['@name'] === newReportSite['@name']);
            // If does not exists add it to the array without further processing
            if (previousSite.length === 0) {
                newReport.updated = true;
                siteClone.push(newReportSite);
            } else {
                // deep clone the variable for further processing
                let newSite = JSON.parse(JSON.stringify(newReportSite));
                let currentAlerts = newReportSite.alerts;
                let previousAlerts = previousSite[0].alerts;

                let newAlerts = _.differenceBy(currentAlerts, previousAlerts, 'pluginid');
                let removedAlerts = _.differenceBy(previousAlerts, currentAlerts, 'pluginid');

                let ignoredAlerts = [];
                if (newReportSite.hasOwnProperty('ignoredAlerts') && previousSite[0].hasOwnProperty('ignoredAlerts')) {
                    ignoredAlerts = _.differenceBy(newReportSite['ignoredAlerts'], previousSite[0]['ignoredAlerts'], 'pluginid');
                }else if(newReportSite.hasOwnProperty('ignoredAlerts')){
                    ignoredAlerts = newReportSite['ignoredAlerts']
                }

                removedAlerts = _.differenceBy(removedAlerts, ignoredAlerts, 'pluginid');

                newSite.alerts = newAlerts;
                newSite.removedAlerts = removedAlerts;
                newSite.ignoredAlerts = ignoredAlerts;
                siteClone.push(newSite);

                if (newAlerts.length !== 0 || removedAlerts.length !== 0 || ignoredAlerts.length !== 0) {
                    newReport.updated = true;
                }
            }
        });
        return siteClone;
    }),

    readMDFile: (async (reportName) => {
        let res = '';
        try {
            res = fs.readFileSync(reportName, {encoding: 'base64'});
        } catch (err) {
            console.log('error while reading the markdown file!')
        }
        return res;
    }),

    checkIfAlertsExists: ((jsonReport) => {
        return jsonReport.site.some((s) => {
            return (s.hasOwnProperty('alerts') && s.alerts.length !== 0);
        });
    }),


    filterReport: (async (jsonReport, plugins) => {
        jsonReport.site.forEach((s) => {
            if (s.hasOwnProperty('alerts') && s.alerts.length !== 0) {
                console.log(`starting to filter the alerts for site: ${s['@name']}`);
                let newAlerts = s.alerts.filter(function (e) {
                    return !plugins.includes(e.pluginid)
                });
                let removedAlerts = s.alerts.filter(function (e) {
                    return plugins.includes(e.pluginid)
                });
                s.alerts = newAlerts;
                s.ignoredAlerts = removedAlerts;

                console.log(`#${newAlerts.length} alerts have been identified` +
                    ` and #${removedAlerts.length} alerts have been ignored for the site.`);
            }
        });
        return jsonReport;
    }),


    readPreviousReport: (async (octokit, owner, repo, workSpace, runnerID) => {
        let previousReport;
        try{
            let artifactList = await octokit.actions.listWorkflowRunArtifacts({
                owner: owner,
                repo: repo,
                run_id: runnerID
            });

            let artifacts = artifactList.data.artifacts;
            let artifactID;
            if (artifacts.length !== 0) {
                artifacts.forEach((a => {
                    if (a['name'] === 'zap_scan') {
                        artifactID = a['id']
                    }
                }));
            }

            if (artifactID !== undefined) {
                let download = await octokit.actions.downloadArtifact({
                    owner: owner,
                    repo: repo,
                    artifact_id: artifactID,
                    archive_format: 'zip'
                });

                await new Promise(resolve =>
                    request(download.url)
                        .pipe(fs.createWriteStream(`${workSpace}/zap_scan.zip`))
                        .on('finish', () => {
                            resolve();
                        }));

                let zip = new AdmZip(`${workSpace}/zap_scan.zip`);
                let zipEntries = zip.getEntries();

                await zipEntries.forEach(function (zipEntry) {
                    if (zipEntry.entryName === "report_json.json") {
                        previousReport = JSON.parse(zipEntry.getData().toString('utf8'));
                    }
                });
            }
        }catch (e) {
            console.log(`Error occurred while downloading the artifacts!`)
        }
        return previousReport;
    }),

    uploadArtifacts: (async (rootDir, mdReport, jsonReport, htmlReport) => {
        const artifactClient = artifact.create();
        const artifactName = 'zap_scan';
        const files = [
            `${rootDir}/${mdReport}`,
            `${rootDir}/${jsonReport}`,
            `${rootDir}/${htmlReport}`,
        ];
        const rootDirectory = rootDir;
        const options = {
            continueOnError: true
        };

        await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)
    })

};

module.exports = actionHelper;
