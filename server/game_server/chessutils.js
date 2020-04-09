exports.hanglie2index = function(hang,lie){
    return hang * 9 + lie;
};

exports.index2hanglie = function(index){
    var hang = Math.floor(index/9);
    var lie = index % 9;
    return [hang,lie];
}