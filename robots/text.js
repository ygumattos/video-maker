const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd')
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1')
const { IamAuthenticator } = require('ibm-watson/auth')

const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const {
    apikey: watsonApiKey,
} = require('../credentials/watson-nlu.json')
const state = require('./states')

const nlu = new NaturalLanguageUnderstandingV1({
    authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
    version: '2018-04-05',
    serviceUrl: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com'
});

async function robot() {
    const content = state.load()

    await featchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentence(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

    async function featchContentFromWikipedia(content) {
        // APIKEY da conta que retorna uma instancia autenticiada do algorithmia 
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)

        // Com essa instancia, conseguimos utilizar a API com o .algo
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2?timeout=300')

        // Aqui temos uma instancia do wikipedia que, com o .pipe, aceita um termo de busca
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)

        // Ao realizar a busca nós podemos extrair o conteúdo através do .get
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content

    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n');

            const withoutBlankLinesAndMarkdown = allLines.filter(line => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }

                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
        }
    }

    function breakContentIntoSentences(content) {
        content.sentences = []
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach(sentence => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    function limitMaximumSentence(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content) {
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }

    async function fetchWatsonAndReturnKeywords(sentence) {

        const { result } = await nlu.analyze({
            text: String(sentence),
            features: {
                keywords: {}
            }
        })

        const keywords = result.keywords.map((keyword) => keyword.text)

        return keywords;
    }
}

module.exports = robot