const path = require('path')
const pluginSrc = "src"

module.exports = {
    name: 'caelum-anuncios'
    ,scripts: {
        glob: path.join(pluginSrc, "*.{js,json}")
    }
    ,templates: {
        glob: path.join(pluginSrc, "templates/**/*.html")
    }
    ,staticAssets: {
        path: path.join(pluginSrc, "assets")
        ,glob: path.join(pluginSrc, "assets/**/*")
    }
}