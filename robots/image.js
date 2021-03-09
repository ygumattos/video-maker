const imageDownloader = require('image-downloader')
const fs = require('fs')
const { resolve } = require('path')
const { google } = require('googleapis')
const customSearch = google.customsearch('v1')


const axios = require('axios')

const state = require('./states')
const googleSearchCredentials = require('../credentials/google-search.json')

async function robot() {
    const content = state.load()

    // await fetchImagesOfAllSentences(content)

    await downloadAllImages(content)
    // state.save(content)

    async function fetchImagesOfAllSentences(content) {
        for (const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)

            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {

        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType: 'image',
            // imgSize: 'huge',
            num: 2
        })

        const imagesUrl = response.data.items.map(item => item.link)
        return imagesUrl
    }

    async function downloadAllImages(content) {
        content.downloadedImages = []


        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex]

                try {

                    if (content.downloadedImages.includes(imageUrl)) throw new Error('Imagem ja foi baixada !!')

                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
                    console.log(`> [${sentenceIndex}] [${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`)
                    break
                } catch (error) {
                    console.log(`> [${sentenceIndex}] [${imageIndex}] Erro ao baixar (${imageUrl}): ${error}`)
                }
            }
        }
    }

    async function downloadAndSave(url, fileName) {

        const path = resolve(__dirname, 'content', fileName)
        const writer = fs.createWriteStream(path)

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        })

        response.data.pipe(writer)

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        })
    }

}

module.exports = robot