const fs = require('fs-extra');
const async = require('async');
const https = require('https');
const parser = require('xml2json');
const drupal = require('./drupal');
const HashMap = require('hashmap');
const DrupalVersion = require('./drupalversion');

require('console.table');


var Composer = function() {
    this.modules = [];
    this.installed = [];
    this.hasUpdate = [];
    this.updates = [];
    this.packages = new HashMap();
}

Composer.prototype.init = function () {
    var promise = new Promise((resolve, reject) => {
        this.load()
            .then(() => {
                return this.loadInstalled();
            })
            .then(() => {
                resolve();
            })
            .catch((e) => {
                reject(e);
            })
    })
    return promise;
}

Composer.prototype.load = function (file) {
    if (!file) {
        file = './composer.json';
    }
    var promise = new Promise((resolve, reject) => {
        fs.readJson(file)
            .then((r) => {
                for (a in r.require) {
                    var package = {
                        name: a,
                        preferred_version: r.require[a],
                        update: false,
                        releases: []
                    }
                    this.packages.set(a, package);
                }
                resolve(true);
            }).catch((e) => {
                reject(e);
            })
    })
    return promise;
}

Composer.prototype.loadInstalled = function (file) {
    if (!file) {
        file = './composer.lock';
    }
    var promise = new Promise((resolve, reject) => {
        fs.readJson(file)
            .then((r) => {
                r.packages.forEach((v) => {
                    if (this.packages.has(v.name)) {
                        var p = this.packages.get(v.name);
                        if (v.name.split('/')[0] === 'drupal') {
                            if (typeof v.version === 'object') {
                                console.log('HERE', v.version);
                                process.exit();
                            }
                            p.version = new DrupalVersion(v.version).getVersion();
                        }
                    
                        this.packages.set(p.name, p);
                    }
                })
                resolve();

            }).catch((e) => {
                reject(e);
            })
    })
    return promise;
}

Composer.prototype.getModules = function() {
    return this.modules;
}

Composer.prototype.getInstalled = function() {
    return this.installed;
}

Composer.prototype.checkForUpdate = function(package) {
    var vendor = package.name.split('/')[0];
    var promise = new Promise((resolve, reject) => {
        if (vendor == 'drupal') {
            drupal.checkModule(package)
                .then((e) => {
                    resolve(e);
                }).catch((e) => {
                    reject(e);
                })

        } else {
            resolve();
        }
    });
    return promise;
}

Composer.prototype.getPackages = function() {
    return this.packages;
}

Composer.prototype.list = function() {
    var data = [];
    this.packages.forEach((v, k) => {
        var d = {
            name: v.name,
            version: v.version,
            prefered_version: v.preferred_version,
            hasUpdate: (v.update === true)   ? '1' : '0'
        };

        if (v.update) {
            d.latest = v.releases.shift().version;
        } else {
            d.latest = 'x';
        }

        data.push(d);
    })
    console.table(data);
}

Composer.prototype.checkAllForUpdate = function(vendor, package, isDrupal) {
    var promise = new Promise((resolve, reject) => {
 
        async.each(this.packages.values(), (package, callback) => {
            this.checkForUpdate(package).then((p) => {
                if (p.update)  {
                    this.packages.set(p.name, p);
                }
                callback();
            }).catch((e) => {
                callback(null, e);
            })
            
        },(err) => {
            resolve();
        })
    })
    return promise;
}


module.exports = new Composer();