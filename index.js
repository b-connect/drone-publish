const Drone = require('drone-node');
const plugin = new Drone.Plugin();

// const REPO_NAME = process.env.DRONE_REPO_NAME;
// const REPO_NAME = process.env.DRONE_REPO_NAME;

console.log(process.env);

// plugin.parse().then((params) => {
//   console.log('params', params.repo);
//
//   // gets build and repository information for
//   // the current running build
//   const build = params.build;
//   const repo  = params.repo;
//
//   // gets plugin-specific parameters defined in
//   // the .drone.yml file
//   const vargs = params.vargs;
// });
