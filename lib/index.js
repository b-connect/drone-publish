#!/usr/bin/env node

const fs = require('fs-extra')

console.log('Start publishing for hugo');

let repository = false;
let hugo_archtype = 'project';
let drone_build_event = process.env.DRONE_BUILD_EVENT;
let drone_repo_owner = process.env.DRONE_REPO_OWNER;
let drone_repo_name = process.env.DRONE_REPO_NAME;
let drone_commit_ref = process.env.DRONE_COMMIT_REF;
let drone_commit_sha = process.env.DRONE_COMMIT_SHA;
let drone_commit_link = process.env.DRONE_COMMIT_LINK;
let drone_commit_tag = process.env.DRONE_TAG;

const execute = require('execute-shell-promise');

if (process.env.PLUGIN_HUGO_ARCHTYPE) {
    hugo_archtype = process.env.PLUGIN_HUGO_ARCHTYPE;
}

if (!process.env.DRONE_REPO_OWNER) {
    drone_repo_owner = 'example';
}

if (!process.env.drone_repo_name) {
    drone_repo_name = 'website';
}

const project_docs_dir = ['./.docs' , hugo_archtype , drone_repo_owner, drone_repo_name].join('/');
const project_index = [project_docs_dir, 'index.md'].join('/');
const project_commit_index =  [project_docs_dir, 'index.md'].join('/');



let stats;
try {
    fs.statSync(project_index);
} catch (ex) {
    fs.ensureFileSync(project_index)
    fs.writeFileSync(project_index,'+++\nrepository = "here"\n+++\n\n');
}

let content = fs.readFileSync(project_index).toString();
content = content.split('+++\n\n');
content[1] = '- new content\n' + content[1];
fs.writeFileSync(project_index, content.join('+++\n\n'))
console.log('End publishing for hugo');
