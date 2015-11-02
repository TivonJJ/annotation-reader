var fs = require('fs');

var linetypes = {
  dbstart : { pattern: /^\s?\/\*\*/ },
  dbanno  : { pattern: /^\s*\*\s?@([\w:-_]+|[\w\(.*?\)])(\s+(.*))?/, returns: { name:1, value:3 } },
  dbend   : { pattern: /^\s?\*\/$/ },
  fnsig1  : { pattern: /^\s?function\s+(\w+)\s?/, returns: { name:1 } },
  fnsig2  : { pattern: /^\s?exports\.(\w+)\s?=\s?function/, returns: { name:1 } },
  fnsig3  : { pattern: /^\s?module\.exports\s?=\s?function/, returns: { name:'anonymous' } },
  fnsig4  : { pattern: /exports\[['"](\w+)['"]\]\s*=\s*function/, returns: { name:1 } },
  fnsig5  : { pattern: /^\s*var\s+(\w+)\s*=\s*function/, returns: { name:1 } },
  fnsig6  : { pattern: /^\s*class\s+(\w+)\s*\{/, returns: { name:1 } },
  fnsig7  : { pattern: /^\s*(\w+)\s*\((.*?)\)\s*\{/, returns: { name:1 } }
};

function trim(str) {
  return 'string' == typeof str ? str.replace(/^\s+/,'').replace(/\s+$/,'') : str;
}

function identify(str) {

  // Try all predefined line type patterns
  for(var i in linetypes) {
    var match;
    // Check for a match
    if(null != (match = str.match( linetypes[i].pattern ))) {

      // Default returns type and regexp match results
      var returns = { id: i, match: match };

      // If specific values are requested, fill those in
      if('undefined' != typeof linetypes[i].returns) {
        for(var r in linetypes[i].returns) {
          returns[r] = 'string' == typeof linetypes[i].returns[r] ?
              linetypes[i].returns[r] : trim(match[linetypes[i].returns[r]]);
        }
      }

      return returns;
    }
  }

  return false;
}

function analyze(data) {

  // Object for holding annotation data
  var annotations = {};

  // Iterate over lines
  var lines = data.split('\n');
  var current = {};
  for(var num in lines) {

    // Get line type
    var type = identify(lines[num]);

    switch(type.id) {
      case 'dbstart':
        // Reset current annotation object
        current = {};
        break;

      case 'dbanno':
        if(type.match && type.match.input && type.value === undefined){
          var input = type.match.input;
          var reg = new RegExp("^[\\s]+\\* @"+type.name);
          var val = input.replace(reg,'').trim();
          if(/^\(.*?\)$/.test(val)){
            type.value = onFn(val);
          }
        }
        // Store whatever was annotated, bucketing values of duplicate keys
        var annotationValue = undefined == type.value || '' == type.value ? true : type.value;
        //if(undefined != current[type.name]) {
        // Create array to hold items
        //if('string' == typeof current[type.name])
        //current[type.name] = [current[type.name]]
        //current[type.name].push(annotationValue);
        //} else {
        current[type.name] = annotationValue;
        //}
        break;

      default: {
        if(/^fnsig[\d]+$/.test(type.id)){
          // Store current annotations under function name
          annotations[type.name] = current;
          current = {};
        }
      }
    }
  }

  return annotations;
}

function onFn(val){
  return(function(){
    val = val.replace(/^\(/,'').replace(/\)$/,'');
    var args = val.split(',');
    args.forEach(function(arg,i){
      args[i] = eval(arg);
    });
    return args;

    //return eval('function'+val+'{return arguments}');
  })();
}

exports.analyze = function(stringData){
  if(typeof stringData == 'string'){
    return analyze(stringData);
  }
  return null;
};

exports.analyzeFile = function(filename,callback){
  fs.readFile(filename, 'utf8', function(err, data) {
    if(!err) {
      var annotations = analyze(data);
      callback(null, annotations);
    } else {
      callback(err, null);
    }
  });
};

exports.analyzeFileSync = function(filename){
  var data = fs.readFileSync(filename, 'utf8');
  if('string' == typeof data) {
    return analyze(data);
  } else {
    return false;
  }
};