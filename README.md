The Horde (group of grunts)
==============================================================================

Overview
------------------------------------------------------------------------------

The Horde is a collection of grunt tasks and utilities to make rolling out grunt across multiple projects much easier.

Setup
------------------------------------------------------------------------------

1. Include The Horde as a submodule in the root of your project.
2. Install npm modules.
```
npm install
```
3. Setup as grunt as per usual in the root of your project
4. Import the utils and tasks from horde like such
```
var tasks = require(require("path").resolve("horde/src/tasks/tasks.js"))(grunt);

var utils = require(require("path").resolve("horde/src/utils/utils.js"))(grunt);
```
