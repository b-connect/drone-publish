
const fs = require('fs-extra');
const composer = require('./lib/composer');
const hugo_archtype = 'project';

require('dotenv').config();

let env = {};

for ( a in process.env ) {
    if (process.env[a]) {
        if (a.split('_')[0] == 'DRONE') {
            env[a] = process.env[a];
        }
    }
}

console.log('Start publishing for hugo');

workspace = env.DRONE_WORKSPACE;

const project_docs_dir = [workspace, '.docs' , hugo_archtype , env.DRONE_REPO_OWNER, env.DRONE_REPO_NAME].join('/');
const build_docs_dir = [workspace, '.docs' , 'post' , env.DRONE_REPO_OWNER, env.DRONE_REPO_NAME].join('/');
const build_doc_name = [build_docs_dir, env.DRONE_BUILD_NUMBER + '.md'].join('/');
const project_index = [project_docs_dir, 'index.md'].join('/');
const project_commit_index =  [project_docs_dir, 'index.md'].join('/');

fs.ensureFileSync(project_index)
let project = require('./lib/page')('project');
project.addHeader('repository', env.DRONE_REPO_LINK);
project.addHeader('categories', [env.DRONE_REPO_OWNER, env.DRONE_REPO_NAME, [env.DRONE_REPO_OWNER, env.DRONE_REPO_NAME].join('/')]);
project.addHeader('project', [[env.DRONE_REPO_OWNER, env.DRONE_REPO_NAME].join('/')]);
project.addHeader('last_build_status', env.DRONE_PREV_BUILD_STATUS);
project.addHeader('build_status', env.DRONE_BUILD_STATUS);
project.addHeader('title',  [env.DRONE_REPO_OWNER, env.DRONE_REPO_NAME].join('/'));
fs.writeFileSync(project_index, project.write())


fs.ensureFileSync(build_doc_name)
let build = require('./lib/page')('post');

build.addHeader('repository', env.DRONE_REPO_LINK);
build.addHeader('project', [[env.DRONE_REPO_OWNER, env.DRONE_REPO_NAME].join('/')]);
build.addHeader('last_build_status', env.DRONE_PREV_BUILD_STATUS);
build.addHeader('build_status', env.DRONE_BUILD_STATUS);
build.addHeader('title', env.DRONE_BUILD_NUMBER);
build.addHeader('author', env.DRONE_COMMIT_AUTHOR);
build.addHeader('avatar', env.DRONE_COMMIT_AUTHOR_AVATAR);
build.addHeader('link', env.DRONE_BUILD_LINK);

try { 
    composer.init().then(() => {
        console.log('composer initialized');
        return composer.checkAllForUpdate();
    }).catch(() => {

    }).then(() => {
        build.addContent('# Module List')
        build.addNewLine();
        var packages = composer.getPackages().values();
        let i = 0;

        packages.forEach((v) => {
            if (v.name.split('/').shift() !== 'drupal') {
                return;
            }
            build.addNewLine();
            build.addContent('## ' + v.name);
            build.addNewLine();
            build.addContent('Installed version:' + v.version);
            build.addNewLine();
            v.releases.forEach((release,k) => {
                let buildOutput = '- New version:' + release.version;
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
                    buildOutput += ' - [View](' + release.release_link[0] + ')';  
                }
                build.addContent(buildOutput);
                build.addNewLine();
            })
            build.addNewLine();
            i++;
            console.log(i);
        })
    }).catch(() => {

    }).then(() => {
        fs.writeFileSync(build_doc_name, build.write())
    })
} catch (e) {
    console.log(e);
}

