var loaderUtils = require('loader-utils');
var postcss     = require('postcss');
var path        = require('path');

module.exports = function (source, map) {
    if ( this.cacheable ) this.cacheable();

    var file    = loaderUtils.getRemainingRequest(this);
    var params  = loaderUtils.parseQuery(this.query);

    var opts = { from: file, to: file };
    if ( params.safe ) opts.safe = true;

    var processors = this.options.postcss;
    if ( params.pack ) {
        processors = processors[params.pack];
    } else if ( !Array.isArray(processors) ) {
        processors = processors.defaults;
    }

    var processed = postcss.apply(postcss, processors).process(source, opts);
    var sourceMap;
    if(params.sourceMapsPropogate) {
        // propogate existing pre-processor source maps
        sourceMap = map;
        // shorten source paths to filenames
        if(sourceMap && params.sourceMapsShortenSources) {
            if(sourceMap.sources) {
                sourceMap.sources = sourceMap.sources.map( function(filePath) {
                    return path.basename(filePath);
                });
            }
        }
        if( typeof sourceMap !== 'string') {
            sourceMap = JSON.stringify(sourceMap);
        }
    }
    else {
        sourceMap = processed.map;
    }
    this.callback(null, processed.css, sourceMap);
};
