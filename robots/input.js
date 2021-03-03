const readLine = require('readline-sync')
const state = require('./states')

function robot() {

    const content = {
        maximumSentences: 7
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefixTerm()
    state.save(content)

    function askAndReturnSearchTerm() {
        return readLine.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefixTerm() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readLine.keyInSelect(prefixes)
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }
}

module.exports = robot
