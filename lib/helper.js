const composer = require('./composer');

var Helper = function(env) {
    this.env = env;

}

Helper.prototype.populatePage = function(build) {
    build.addHeader('repository', this.env.DRONE_REPO_LINK);
    build.addHeader('categories', [this.env.DRONE_REPO_OWNER, this.env.DRONE_REPO_NAME, [this.env.DRONE_REPO_OWNER, this.env.DRONE_REPO_NAME].join('/')]);
    build.addHeader('project', [[this.env.DRONE_REPO_OWNER, this.env.DRONE_REPO_NAME].join('/')]);
    build.addHeader('last_build_status', this.env.DRONE_PREV_BUILD_STATUS);
    build.addHeader('build_status', this.env.DRONE_BUILD_STATUS);
    build.addHeader('title',  [this.env.DRONE_REPO_OWNER, this.env.DRONE_REPO_NAME].join('/'));
    return build;
}

Helper.prototype.populateBuild = function(build) {
    build.addHeader('repository', this.env.DRONE_REPO_LINK);
    build.addHeader('project', [[this.env.DRONE_REPO_OWNER, this.env.DRONE_REPO_NAME].join('/')]);
    build.addHeader('last_build_status', this.env.DRONE_PREV_BUILD_STATUS);
    build.addHeader('build_status', this.env.DRONE_BUILD_STATUS);
    build.addHeader('title', this.env.DRONE_BUILD_NUMBER);
    build.addHeader('author', this.env.DRONE_COMMIT_AUTHOR);
    build.addHeader('avatar', this.env.DRONE_COMMIT_AUTHOR_AVATAR);
    build.addHeader('link', this.env.DRONE_BUILD_LINK);
    return build
}

Helper.prototype.writeGitLog = function(build) {
    var promise = new Promise((resolve, reject) => {
        var git = require('simple-git')( workspace );
        git.log({
                from: this.env.DRONE_PREV_COMMIT_SHA,
                to: this.env.DRONE_COMMIT_SHA
            },(err, log) => {
                if (err) {
                    return reject(e);
                }
                build.addContent('# Gitlog');
                build.addTableHeader(['Date', 'Message', 'Author', 'Mail']);
                log.all.forEach((v) => {
                    build.addTableCells([
                        v.date,
                        v.message,
                        v.author_name,
                        v.author_email
                    ]);
                })
                resolve(build);
            })
    });

    return promise;


}

Helper.prototype.writeComposerInfo = function (build) {
   return composer.init().then(() => {
        console.log('composer initialized');
        return composer.checkAllForUpdate();
    }).catch(() => {

    }).then(() => {
        var promise = new Promise((resolve, reject) => {
            build.addContent('# Module List')
            var packages = composer.getPackages().values();
            build.addTableHeader(['Module', 'Installed', 'Updates']);
            packages.forEach((v) => {
                if (v.name.split('/').shift() !== 'drupal') {
                    return;
                }
                let buildOutput = '';
                v.releases.forEach((release,k) => {
                    buildOutput += '* ' + release.version;
                    if (release.terms) {
                        let rTerms = [];
                        release.terms.forEach((terms) => {
                            terms.term.forEach((term) => {
                                rTerms.push(term.value[0])
                            })
                        })
                        buildOutput += ' (' + rTerms.join(', ') + ')';
                    }
                    if (release.release_link) {
                        buildOutput += '  [View](' + release.release_link[0] + ')';  
                    }
                    
                })
                build.addTableCells([
                    (v.update) ? '**' + v.name + '**' : v.name,
                    v.version,
                    buildOutput
                ]);
            })
            resolve(build);
        })
        return promise;
    });
}

module.exports = function(env) {
    return new Helper(env);
}