var reader = require('../lib/annotation-reader');
console.log(reader.analyzeFileSync('./js/test-class.js'));

var fs = require('fs');
var data = fs.readFileSync('./js/test-class.js','utf-8');
console.log(reader.analyze(data));

reader.analyzeFile('./js/test-fn.js',function(err,result){
    if(err)throw err;
    console.log(result);
});