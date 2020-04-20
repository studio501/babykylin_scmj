exports.isEmpty = function(tbl){
    return !tbl || tbl.length === 0 || Object.keys(tbl).length === 0;
}

exports.append = function(tbl1,tbl2){
    if(exports.isEmpty(tbl1) || exports.isEmpty(tbl2)){
        return;
    }

    for(var i=0;i<tbl2.length;i++){
        tbl1.push(tbl2[i]);
    }
}

exports.find = function(tbl,func){
    if(exports.isEmpty(tbl)){
        return;
    }

    for( var i = 0; i < tbl.length; i++) {
        if(func(tbl[i])){
            return {value:tbl[i], key:i};
        }
    }
}

exports.contains = function(tbl,func){
    if(exports.isEmpty(tbl)){
        return false;
    }

    for( var i = 0; i < tbl.length; i++) {
        if(func(tbl[i])){
            return true;
        }
    }
    return false;
}

exports.findAll = function(tbl,func){
    if(exports.isEmpty(tbl)){
        return;
    }
    var res = [];
    for( var i = 0; i < tbl.length; i++) {
        if(func(tbl[i])){
            res.push( {value:tbl[i], key:i});
        }
    }
    return res;
}

/**
 * [                                  [
 *      {"a":100,"b":100},               {"a":100},
 *      {"a":10,"b":10},     ====>       {"a":10},
 * ]                                  ]
 */
exports.trimTbl = function(tbl,trim_keys){
    if(exports.isEmpty(tbl)){
        return [];
    }

    if(exports.isEmpty(trim_keys)){
        return tbl;
    }

    var res = [];
    for( var i = 0; i < tbl.length; i++) {
        var t = {}
        for( var j = 0; j < trim_keys.length; j++) {
            t[trim_keys[j]] = tbl[i][trim_keys[j]];
        }
        res.push(t);
    }
    return res;
}