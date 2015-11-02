# annotation-reader
annotation-reader for js,supported ES-6 Class

###example files###
> test-class.js

```javascript

"use strict";
/**
 * @routerPrefix /wxAPI/;
 */
class Test {
    /**
     * @router aaa
     */
    constructor(){

    }

    /**
     * @uri /test
     * @method GET
     */
    test() {

    }

    /**
     * @router vvv
     */
    testB(a,f){

    }
}
module.exports = Test;
```

> test-fn.js

```javascript
/**
 *
 * @annotation annotation for anonymous function export
 * @load:user parameter:id
 */
function someFunction() {
    // Does something exciting
}
/**
 *
 * @annotation CCCC
 * @load:user FFFFF:id
 */
someFunction.prototype.c = function(){

}
```

###usage###

```javascript
var reader = require('../lib/annotation-reader');
console.log(reader.analyzeFileSync('./js/test-class.js'));

var fs = require('fs');
var data = fs.readFileSync('./js/test-class.js','utf-8');
console.log(reader.analyze(data));

reader.analyzeFile('./js/test-fn.js',function(err,result){
    if(err)throw err;
    console.log(result);
});
```

###installation###

```npm install annotation-reader```