// translates _("strings") into their international equivalents
var ConstDependency = require("webpack/lib/dependencies/ConstDependency");
var SnippetDependency = require("./SnippetDependency");
var NullFactory = require("webpack/lib/NullFactory");

function SnippetTranslatorPlugin(options) {
  if(typeof options !== "object") options = {};
  this.options = options;
}
module.exports = SnippetTranslatorPlugin;

function copy(from) {
  var to = Object.create(null);
  to.prototype = from.prototype;
  for (var key in from) {
    to[key] = from[key];
  }
  return to;
}

SnippetTranslatorPlugin.prototype.apply = function(compiler) {
  var options = this.options;
  options.locales = options.locales || ['en'];
  options.test = options.test || /\.js($|\?)/i;

  compiler.plugin("compilation", function(compilation) {
    compilation.dependencyFactories.set(SnippetDependency, new NullFactory());
    compilation.dependencyTemplates.set(SnippetDependency, new SnippetDependency.Template());
  });

  var name = "_";
  // find every invocation of _() and wrap the content of the first string
  compiler.parser.plugin("call " + name, function(expr) {
    var param = this.evaluateExpression(expr.arguments[0]);
    if (!param.isString()) return;
    var dep = new SnippetDependency(param.range);
    dep.loc = expr.loc;
    this.state.current.addDependency(dep);
  });

  compiler.plugin("compilation", function(compilation) {
    // as late as possible in the build, to avoid reminifying assets for each language
    // make the extra language bundles
    compilation.plugin("optimize-assets", function(assets, callback) {
      Object.keys(assets).forEach(function(key) {
        options.locales.forEach(function(lang) {
          assets[key + '-' + lang] = copy(assets[key]);
          // TODO actual translations here
        });
      });
      callback();
    });
  });
};
