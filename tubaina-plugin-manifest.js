const path = require('path')
const pluginSrc = "src"

module.exports = {
    scripts: path.join(pluginSrc, "*.{js,json}")
    ,templates: {
        pdf: path.join(pluginSrc, "templates/**/*.html")
        ,html: path.join(pluginSrc, "templates/**/*.html")
    }
    ,staticAssets: {
        pdf: path.join(pluginSrc, "assets/**/*")
        ,html:  path.join(pluginSrc, "assets/**/*")
    }
}