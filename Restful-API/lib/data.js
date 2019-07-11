/**
 * Library for storing and editing data
 * 
 */

// Dependencies
var fs = require('fs');
var path = require('path');

//Container for the module to be exported
var lib = {};

//Base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

//write data to a file
lib.create = function(dir, file, data, callback) {
    // open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {
            //convert data to string
            var stringData = JSON.stringify(data);

            //write to file and close it
            fs.write(fileDescriptor, stringData, function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Error writing to new file');
                }
            });
        } else {
            callback('couldn\'t create new file, it may already exist');
        }
    });
};

//Read data from a file
lib.read = function(dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data) {
        callback(err, data);
    });
};

//Update data inside a file
lib.update = function(dir, file, data, callback) {
    //open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {
            var stringData = JSON.stringify(data);

            //truncate the file
            fs.truncate(fileDescriptor, function(err) {
                if (!err) {
                    //write to the file and close 
                    fs.writeFile(fileDescriptor, stringData, function(err) {
                        if (!err) {
                            fs.close(fileDescriptor, function(err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing existing file');
                                }
                            });
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback('couldn\'t open the file for updating, it may not exist');
        }
    });
};

//Delete file
lib.delete = function(dir, file, callback) {
    //unlink the file
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', function(err) {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

//export the module
module.exports = lib;