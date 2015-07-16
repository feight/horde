The Horde (group of grunts)
==============================================================================

Overview
------------------------------------------------------------------------------

Horde is a collection of grunt tasks and utilities to make rolling out grunt across multiple projects much easier.

Setup
------------------------------------------------------------------------------

1. Include horde as a submodule in the project you would like to use it.
2.Run the setup bash

```

./setup.sh

```

3. Setup as grunt as per usual in the root of your project

4. Import the utils and tasks from horde like such

```

    var tasks = require(require("path").resolve("horde/src/tasks/tasks.js"))(grunt);

    var utils = require(require("path").resolve("horde/src/utils/utils.js"))(grunt);

```
