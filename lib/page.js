var Page = function(type) {
  this.headers = {};
  this.contents = [];
  this.type = type;
  this.spacer = 0;
}

Page.prototype.addHeader = function(name, value)  {
  this.headers[name] = value;
}

Page.prototype.addContent = function(value) {
  this.contents.push(value);
}

Page.prototype.write = function() {
  var output = JSON.stringify(this.headers, null, 2) + "\n\n";
  output += this.contents.join("");
  return output;
}

Page.prototype.addNewLine = function() {
  this.addContent("\n");
}

module.exports = function(type) {
  return new Page(type);
} 
