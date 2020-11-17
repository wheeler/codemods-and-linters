## Mac OSX notes

### Running codemods using `find ... | xargs ...`

`find path_to_your/components/ -name *.[jt]sx | xargs jscodeshift -t scripts/your_script.js --parser=tsx`

This method has advantages over using `/**/` glob to run bulk scripts.
- Works with the default mac bash terminal, no installation/configuration of higher version bash necessary!
- Does not have error `Argument list too long` when there are too many matching files.

### [OLD] ~Running codemods using glob `/**/`~ :x:&nbsp;`find` described above preferred

The default version of bash on OSX is 3.2.57 which is super old and does not support `**` glob patterns. These are supported in bash 4+. You must use higher bash version and then turn it on. Apparently Apple won't use a newer version than this one from 2007 because they don't like GPL3 which was added.

check your version
```bash
# check your version
$ bash --version
> GNU bash, version 3.2.57(1)-release (x86_64-apple-darwin19)
> Copyright (C) 2007 Free Software Foundation, Inc.
```

install newer version with brew
```bash
$ brew install bash

$ /usr/local/bin/bash
bash-5.0$
```

turn globstar on, run jscodeshift with a globstar pattern
```bash
bash-5.0$ shopt -s globstar

# now you can run
bash-5.0$ jscodeshift -t script/jscodeshift/my_codemod.js frontend/javascripts/**/components/**/*.jsx 
```
