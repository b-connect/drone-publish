const https = require('https');
const parser = require('xml2json');
const semver = require('semver');
const DrupalVersion = require('./drupalversion');

var Drupal = function() {

}

Drupal.prototype.checkModule = function (package) {
    var vendor = package.name.split('/')[0];
    var module = package.name.split('/')[1];
    console.log('Check updates for ' + package.name);
    var installedRelease = package.version;
    var promise = new Promise((resolve, reject) => {
        var url = 'https://updates.drupal.org/release-history/' + module + '/8.x';
        https.get(url, (res) => {
            res.on('data', (d) => {
                var output = this.resolveToComposer(d.toString());
                if (output === false) {
                    return resolve(package);
                }
                if (!output.project || !output.project[0].releases || !output.project[0].releases[0].release) {
                    return resolve(package);
                }

                output.project[0].releases[0].release.forEach((v) => {
                    if (!v.version) {
                        return resolve(package);
                    }
                    if (!v.version[0]) {
                        return resolve(package);
                    }

                    var version = new DrupalVersion(v.version[0]);
                    var installed = DrupalVersion.composerToDrupal(package.version);
                    if (version.gt(installed)) {
                        package.update = true;
                        package.releases.push(v);
                    }
                })
                resolve(package);
            });

        }).on('error', (e) => {
            console.error('error', e);
            reject(e);
        });
    })
    return promise;

}

Drupal.prototype.resolveToComposer = function (xmlData) {
    try {
        return parser.toJson(xmlData,{
            object: true,
            coerce: true,
            arrayNotation: true
        });
    } catch (e) {;
        return false;
    }
}

module.exports = new Drupal();