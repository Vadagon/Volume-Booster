const ExtensionReloader = require('webpack-extension-reloader')
const config = require('./custom-webpack.config');
const path = require('path');

module.exports = {...config, 
    mode: 'development',
    plugins: [new ExtensionReloader({
        reloadPage: true,
        manifest: path.resolve(__dirname, "src/manifest.json")
        // entries: {
        //     background: 'background',
        //     contentScript: ['content']
        //     // extensionPage: ['popup']
        // }
    })]
}