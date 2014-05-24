module.exports = (grunt) ->

  grunt.initConfig

    build:
      client: 'src/**/*.js'

    # JSHint options
    # http://www.jshint.com/options/
    jshint:
      plugin:
        files:
          src: 'lib/**/*.js'
        options:
          # node
          node: true,
          strict: false
      client:
        files:
          src: 'client/**/*.js'

      options:
        quotmark: 'single'
        bitwise: true
        indent: 2
        camelcase: true
        strict: true
        trailing: true
        curly: true
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noempty: true
        unused: true
        noarg: true
        sub: true
        undef: true
        maxdepth: 4
        maxlen: 100
        globals: {}

    karma:
      client:
        configFile: 'karma.conf.js'
        autoWatch: false
        singleRun: true
      tdd:
        configFile: 'karma.conf.js'
        autoWatch: true
        singleRun: false

    'npm-contributors':
      options:
        commitMessage: 'chore: update contributors'

    bump:
      options:
        commitMessage: 'chore: release v%VERSION%'
        pushTo: 'upstream'

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-karma'
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-npm'
  grunt.loadNpmTasks 'grunt-auto-release'

  grunt.registerTask 'default', ['karma:client', 'build']
  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      'build'
      'npm-contributors'
      "bump:#{type||'patch'}"
      'npm-publish'
    ]
