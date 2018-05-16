'use babel';

import { CompositeDisposable } from 'atom'

// Load Shell, fs and path for launching
// external website urls, and loading json
// files with all the references
shell = require('shell')
fs = require('fs')
path = require('path')

// Load JSON Snippets
var snippetsPath = '/../snippets/p5play-snippets.json'
var snippetsFile = path.join(__dirname, snippetsPath)
var initialFileContents = JSON.parse(fs.readFileSync(snippetsFile))

// List Items that should possibly be
// removed on the context menu
var ban_menus = {
  "Find in the p5.play docs": true
}

export default {

  subscriptions: null,
  referenceUrl: false,

  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'p5play-snippets:fetch': () => this.fetch(),
      'p5play-snippets:ref': () => this.ref()
    }))

    let editor
    let self = this

    // Add p5play reference link to contextMenu
    // This can be done through menus/p5play-snippets.cson
    atom.contextMenu.add({
      'atom-text-editor': [
        {type: 'separator'},
        {

          'label': 'Find in the p5.play docs',
          'command': 'p5play-snippets:fetch',
          shouldDisplay: function shouldDisplay(event) {
            //console.log(event)
            if (editor = atom.workspace.getActiveTextEditor()) {

              // Find cursor
              let cursor = editor.getLastCursor()

              if(cursor.isInsideWord()){

                // If not ( { - + / }) ect
                var word = editor.buffer.getTextInRange(cursor.getCurrentWordBufferRange())

                // find Reference
                self.referenceUrl = self.findRefence(word) || false

                if(self.referenceUrl !== false) {
                  return true //show p5 link
                } else {
                  return false //hide p5 link
                }
              }
            }

          }
        },
        {type: 'separator'}
      ]
    })
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  findRefence(word)
  {
    var isWordFound = false
    for (p5playRef in initialFileContents['.source.js'])
    {
      for (subItem in initialFileContents['.source.js'][p5playRef])
      {
        var name = initialFileContents['.source.js'][p5playRef].leftLabel.toString()
        name = name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '') // strip special characters for comparison with your selection
        //console.log(initialFileContents['.source.js'][p5playRef])
        //console.log(initialFileContents['.source.js'][p5playRef].leftLabel)
        //console.log(initialFileContents['.source.js'][p5playRef].descriptionMoreURL)
        //console.log(name + '  ' + word)
        if (name == word)
        {
          return initialFileContents['.source.js'][p5playRef].descriptionMoreURL
        }
      }
    }
    return isWordFound
  },

  fetch() {
    let self = this
    shell.openExternal(self.referenceUrl)
  },

  ref() {
    shell.openExternal('http://p5play.molleindustria.org/docs/')
  }
}
