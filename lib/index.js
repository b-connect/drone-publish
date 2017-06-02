#!/usr/bin/env node

const fs = require('fs-extra')

let repository = false;
let hugo_archtype = 'project';
let drone_build_event = process.env.DRONE_BUILD_EVENT;
let drone_repo_owner = process.env.DRONE_REPO_OWNER;
let drone_repo_name = process.env.DRONE_REPO_NAME;
let drone_commit_ref = process.env.DRONE_COMMIT_REF;
const execute = require('execute-shell-promise');

if (!process.env.PLUGIN_REPOSITORY) {
    process.exit('Please provide a repository')
}

console.log(process.cwd());

fs.ensureDir('./.docs')
    .then(() => {
        console.log('Created documentation dir')
        return execute('git clone ' + repository + ' ./.docs');
    }).then((stdout) => {
        console.log(stdout);

    })
