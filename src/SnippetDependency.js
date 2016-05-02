/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var NullDependency = require("webpack/lib/dependencies/NullDependency");

function SnippetDependency(strRange) {
	NullDependency.call(this);
	this.strRange = strRange;
}
module.exports = SnippetDependency;

SnippetDependency.prototype = Object.create(NullDependency.prototype);
SnippetDependency.prototype.constructor = SnippetDependency;

SnippetDependency.Template = function SnippetDependencyTemplate() {};

SnippetDependency.Template.prototype.apply = function(dep, source) {
  var src = source._source.source();
  source.replace(dep.strRange[0], dep.strRange[1] - 1, JSON.stringify(this.wrap(this.getStringRange(src, dep.strRange))));
};

SnippetDependency.Template.prototype.wrap = function(str) {
  return "_____I18N>>>>>" + str + "<<<<<I18N_____";
};

SnippetDependency.Template.prototype.getStringRange = function(src, range) {
  return src.substring(range[0] + 1, range[1] - 1);
};

SnippetDependency.prototype.updateHash = function(hash) {
	hash.update(this.range + "");
	hash.update(this.expression + "");
};
