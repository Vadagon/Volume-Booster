module.exports = {
  mode: "development", // The plugin is activated only if mode is set to development
  watch: true,
  entry: {
    background: 'src/background.ts',
    content: 'src/content.ts'
  },
}
