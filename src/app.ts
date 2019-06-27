import * as assert from 'assert'
import * as config from 'config'
import {version} from '../package.json'
import {logger} from './common'
import updatePricefeed from './pricefeed'

export async function main() {
    logger.info({version}, 'starting')
    const updateInterval = parseInt(config.get('update_interval'), 10) * 1000
    assert(isFinite(updateInterval), 'Invalid update interval')
    const update = async () => {
        try {
            await updatePricefeed()
        } catch (error) {
            logger.error(error, 'Unable to update pricefeed')
        }
    }
    update()
    setInterval(update, updateInterval)
}

function ensureExit(code: number, timeout = 3000) {
    process.exitCode = code
    setTimeout(() => { process.exit(code) }, timeout)
}

if (module === require.main) {
    process.once('uncaughtException', (error) => {
        logger.error(error, 'Uncaught exception')
        ensureExit(1)
    })
    main().catch((error) => {
        logger.fatal(error, 'Unable to start application')
        ensureExit(1)
    })
}
