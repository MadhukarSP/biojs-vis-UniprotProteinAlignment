/*
 * biojs-vis-uniprotproteinalignment
 * https://github.com/MadhukarSP/biojs-vis-uniprotproteinalignment
 *
 * Copyright (c) 2015 MadhukarSP
 * Licensed under the MIT license.
 */

/**
@class biojsvisuniprotproteinalignment
 */


var  biojsvisuniprotproteinalignment;
module.exports = biojsvisuniprotproteinalignment = function(opts){
  this.el = opts.el;
  this.el.textContent = biojsvisuniprotproteinalignment.hello(opts.text);
};

/**
 * Private Methods
 */

/*
 * Public Methods
 */

/**
 * Method responsible to say Hello
 *
 * @example
 *
 *     biojsvisuniprotproteinalignment.hello('biojs');
 *
 * @method hello
 * @param {String} name Name of a person
 * @return {String} Returns hello name
 */


biojsvisuniprotproteinalignment.hello = function (name) {

  return 'hello ' + name;
};

