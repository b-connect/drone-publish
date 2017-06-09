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

const helper = require('./lib/helper')(env);

console.log('Start publishing for hugo');

workspace = env.DRONE_WORKSPACE;

const project_docs_dir = [workspace, '.docs' , hugo_archtype , env.DRONE_REPO_OWNER, env.DRONE_REPO_NAME].join('/');
const build_docs_dir = [workspace, '.docs' , 'post' , env.DRONE_REPO_OWNER, env.DRONE_REPO_NAME].join('/');
const build_doc_name = [build_docs_dir, env.DRONE_BUILD_NUMBER + '.md'].join('/');
const project_index = [project_docs_dir, 'index.md'].join('/');
const project_commit_index =  [project_docs_dir, 'index.md'].join('/');


let project = require('./lib/page')('project');
project = helper.populatePage(project);
project.write(project_index);


let build = require('./lib/page')('post');
build = helper.populateBuild(build);

build.addContentGroup('composer', -100, true);
helper.writeComposerInfo(build)
    .then((build) => {
        build.addContentGroup('git', -200, true);
        return helper.writeGitLog(build);
    })
    .then((build) => {
        build.write(build_doc_name);
    })


// try { 
//     composer.init().then(() => {
//         console.log('composer initialized');
//         return composer.checkAllForUpdate();
//     }).catch(() => {

//     }).then(() => {
//         var promise = new Promise((resolve, reject) => {
//             build.addContent('# Module List')
//             var packages = composer.getPackages().values();

//             packages.forEach((v) => {
//                 if (v.name.split('/').shift() !== 'drupal') {
//                     return;
//                 }
//                 build.addContent('**' + v.name + '**');
//                 build.addContent('Installed version:' + v.version);
//                 v.releases.forEach((release,k) => {
//                     let buildOutput = '- New version:' + release.version;
//                     if (release.terms) {
//                         let rTerms = [];
//                         release.terms.forEach((terms) => {
//                             terms.term.forEach((term) => {
//                                 rTerms.push(term.value[0])
//                             })
//                         })
//                         buildOutput += ' (' + rTerms.join(', ') + ')';
//                     }
//                     if (release.release_link) {
//                         buildOutput += ' - [View](' + release.release_link[0] + ')';  
//                     }
//                     build.addContent(buildOutput);
//                 })
//             })
//             build.addContentGroup('git', -200, true);
//             var git = require('simple-git')( workspace );

//         })
 
//         return promise;
//     }).then(() => {
//         console.log('READY');
//     }).catch(() => {

//     }).then(() => {
//         build.write(build_doc_name);
//     })
// } catch (e) {
//     console.log(e);
// }

