const semver = require('semver');

var DrupalVersion = function(string) {
    this.initialVersion = this.version = string;
    this.valid = false;
    this.isDevVersion = false;
    this.regex = /^([7,8])\.x\-(\d+)\.?(\d+)\-?(.+)?/g;
    this.regexDev = /^([7,8])\.x\-(\d+)\.?(x)\-?(.+)?/g;
    this.regexComposer = /^(\d+)\.(\d+)\.(\d+)\-?(.+)?/g;
    this.regexDev2 = /^dev\-(\d+)\.x/g;
    this.parse();
    
}

DrupalVersion.prototype.getVersion = function() {
    return this.version;
}

DrupalVersion.prototype.gt = function (version) {
    try {
      if ( semver.valid(version) === null || !semver.valid(this.version) === null) {
          console.log('Invalid version', version, this.version);
          return false;
      }
    } catch (e) {
        return false;
    }
    return semver.gt(this.version, version);
}

DrupalVersion.prototype.satisfies = function (version) {
    return semver.satisfies(this.version, version);
}

DrupalVersion.prototype.lt = function (version) {
    return semver.gt(this.version, version);
}

DrupalVersion.prototype.parse = function() {
    if (this.initialVersion === '') {
        return;
    }
    if (semver.valid(this.initialVersion)) {
        return;
    }
    var test = this.regex;
    var regex = this.regex;
    if (m = this.regex.exec(this.initialVersion)) {
        m = m.slice(1, 5);
    } else if (m = this.regexDev.exec(this.initialVersion)) {
        m = m.slice(1, 5);
        m[2] = '0';
        this.isDevVersion = true;
    } else if (m = this.regexComposer.exec(this.initialVersion)) {
        m = m.slice(1, 3);
        m.unshift(8);
    } else if (m = this.regexDev2.exec(this.initialVersion)) {
        m = [m[1],'0','0','dev']
    }
    if (m !== null) {
        this.version = [m[0], m[1], m[2]].join('.');
        if (m[3]) {
            this.version = [this.version, m[3]].join('-');
        }
    }
}

DrupalVersion.composerToDrupal = function(version) {
    var newVersion = [
        '8',
        semver.major(version),
        semver.minor(version)
    ].join('.');
    if (semver.prerelease(version)) {
        newVersion = newVersion + '-' + semver.prerelease(version).join('.');
    }
    return newVersion;
}

DrupalVersion.prototype.getVersion = function() {
    return this.version;
}

// isDev = /^(dev)-(\w)/g

module.exports = DrupalVersion;