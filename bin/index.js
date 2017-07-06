'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')

module.exports = () => {
  let folderPath = path.resolve(__dirname, '../resource')
  let files = fs.readdirSync(folderPath)

  files.forEach((fileName) => {
    let filePath = path.resolve(folderPath, fileName)
    let lineReader = readline.createInterface({
      input: fs.createReadStream(filePath)
    })

    let jsonObject = {}
    let header = null
    let contents = []
    lineReader.on('line', (line) => {
      if (!header) {
        header = line
      } else {
        contents.push(line)
      }
    })

    lineReader.on('close', () => {
      header = translate(header)

      jsonObject.header = header

      let lines = jsonObject.lines = []

      contents.forEach(lineData => {
        lineData = translate(lineData)

        let lineItem = {}

        // loop headers and set value from lineData
        Object.entries(header).forEach(([key, item]) => {
          lineItem[item] = lineData[key]
        })

        lines.push(lineItem)
      })

      let outputFolder = path.resolve(__dirname, '../output')
      let outputFile = fileName.replace(/\.csv$/, '.json')

      let outputPath = path.resolve(outputFolder, outputFile)

      // output
      fs.writeFileSync(outputPath, JSON.stringify(jsonObject))

      console.log(`write file complete: ${outputPath}`)
    })
  })
}

// translate
function translate (text) {
  // split string with `,`
  text = text.replace(/"[^"]*(,)+?[^"]*"/, $1 => $1.replace(/,/, '$dot$'))
  let arr = text.split(',').map((value, index) => ({
    value,
    index
  }))

  // filter empty items
  arr = arr.filter(item => item.value)

  let result = {}

  // build object with index & text
  arr.forEach(item => {
    result[item.index] = String(item.value).replace(/\$dot\$/g, ',')
  })

  return result
}
