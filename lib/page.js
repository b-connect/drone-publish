const fs = require('fs-extra');
const sanitizer = require('sanitizer');
const _ = require('lodash')

_.mixin({
    'sortKeysBy': function (obj, comparator) {
        var keys = _.sortBy(_.keys(obj), function (key) {
            return comparator ? comparator(obj[key], key) : key;
        });
    
        return _.zipObject(keys, _.map(keys, function (key) {
            return obj[key];
        }));
    }
});

var Page = function(type) {
  this.headers = {};
  
  this.type = type;
  this.spacer = 0;
  this.defaultContentGroup = 'main';
  this.initGroup = this.defaultContentGroup;
  this.contents = {};
  this.contents[this.defaultContentGroup] = [];
  this.weights = {
    'main' : -100
  };
  console.log(this.contents);
}

Page.prototype.addHeader = function(name, value)  {
  this.headers[name] = value;
}

Page.prototype.addTableCells = function(values) {
  let output = '| ' + values.join(' | ') + ' |' + "\n";
  this.addContent(output, true)
}
Page.prototype.addTableHeader = function(values) {
  let output = '| ' + values.join(' | ') + ' |' + "\n";
  var headers = [];
  for (var i=0; i < values.length; i++) {
    headers.push('---');
  }
  output += '| ' + headers.join(' | ') + ' |' + "\n";
  this.addContent(output, true)
}


Page.prototype.addContent = function(value, withoutNewLine) {
  this.contents[this.defaultContentGroup].push(sanitizer.escape(value));
  if (!withoutNewLine) {
    this.contents[this.defaultContentGroup].push("\n\n")
  }
}

Page.prototype.addMarkdown = function(value, withoutNewLine) {
  this.contents[this.defaultContentGroup].push(value);
  if (!withoutNewLine) {
    this.contents[this.defaultContentGroup].push("\n\n")
  }
}

Page.prototype.addContentGroup = function(name, weight, setActive) {
  this.contents[name] = [];
  this.weights[name] = weight;
  if (setActive) {
    this.defaultContentGroup = name;
  }
}

Page.prototype.addContentToGroup = function(group, value, withoutNewLine) {
  if (!this.content[group]) {
    this.addContentGroup(group, 0)
  }
  this.contents[group].push(sanitizer.escape(value));
  if (!withoutNewLine) {
    this.contents[group].push("\n\n");
  }
}

Page.prototype.print = function() {

  var weights = _.sortKeysBy(this.weights, function (value, key) {
    return value;
  });
  console.log(weights);
  var output = JSON.stringify(this.headers, null, 2) + "\n\n";

  for ( var a in weights ) {
    output += this.contents[a].join("");
  }

  return output;
}

Page.prototype.write = function(file) {
  fs.ensureFileSync(file);
  fs.writeFileSync(file, this.print())
}

module.exports = function(type) {
  return new Page(type);
} 
