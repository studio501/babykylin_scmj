var fs = require("fs"), path = require("path");

function walk(dir, callback) {
    fs.readdir(dir, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            var filepath = path.join(dir, file);
            fs.stat(filepath, function (err, stats) {
                if (stats.isDirectory()) {
                    walk(filepath, callback);
                } else if (stats.isFile()) {
                    if (path.extname(filepath) === '.json') {
                        fs.readFile(filepath, function (err, data) {
                            if (err) throw err;
                            callback(filepath, JSON.parse(data));
                        })
                    }
                }
            });
        });
    });
}

function counter_dir(dir, outer, ext) {
    var all_files = fs.readdirSync(dir);
    for (var i = 0; i < all_files.length; i++) {
        var f = all_files[i];
        var file_path = path.join(dir, f);
        var f_info = fs.statSync(file_path);
        if (f_info.isFile()) {
            var ep = path.extname(f);
            if (ep === '.json') {
                outer[0]++;
            }
        } else if (f_info.isDirectory()) {
            counter_dir(file_path, outer, ext);
        }
    }
}

exports.init = function (dst_dir, call_back) {
    var res = {};
    exports.data_cfg = res;

    var sum = [0];
    counter_dir(dst_dir, sum, '.json');

    var couter_i = 0;
    walk(dst_dir, function (filepath, js_data) {
        couter_i++;
        res[filepath.substring(0, filepath.length - 5)] = js_data;
        if (couter_i === sum[0] && call_back) {
            call_back();
        }
    })
}
