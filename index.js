const mic = require("@scottishcyclops/node-recorder")
const { Detector, Models } = require("snowboy")
const { basename } = require("path")

/**
 * Create a new hotword detector using snowboy
 * @param {string} file pmdl or umdl snowboy file. filename should be the hotword
 * @param {{sensitivity: number, audioGain: number}} options additional optional parameters
 */
module.exports = (file, options) =>
{
    const hotwords = basename(file).split(".")[0]

    const models = new Models
    models.add({
        file,
        hotwords,
        sensitivity: isNaN(options.sensitivity) ? "0.5" : options.sensitivity.toString(),
    })

    const detector = new Detector({
        models,
        resource: __dirname + "/node_modules/snowboy/resources/common.res",
        audioGain: isNaN(options.audioGain) ? 1 : options.audioGain
    })

    const stop = () =>
    {
        detector
        .removeAllListeners("error")
        .removeAllListeners("hotword")

        mic.stop()
    }

    return {
        listen: () => new Promise((resolve, reject) =>
        {
            detector.once("error", error =>
            {
                console.log("erroooor", error)
                stop()
                reject(error)
            })

            detector.once("hotword", () =>
            {
                console.log("hotworddddd")
                stop()
                resolve()
            })

            detector.on("sound", () => console.log("sound"))
            detector.on("silence", () => console.log("silence"))

            const audio = mic.start({ threshold: 0.01 }).audio

            audio.pipe(detector)
        })
    }
}
