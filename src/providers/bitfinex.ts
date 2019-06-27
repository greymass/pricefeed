import fetch from 'node-fetch'
import { PriceProvider } from '../price-provider'

export default class BitfinexProvider implements PriceProvider {

    name = 'Bitfinex'

    async getPair(name: string) {
        const res = await fetch(`https://api-pub.bitfinex.com/v2/ticker/t${name}`)
        if (!res.ok) {
            throw new Error('Not OK: ' + res.statusText)
        }
        const [
            BID, BID_SIZE, ASK, ASK_SIZE, DAILY_CHANGE,
            DAILY_CHANGE_PERC, LAST_PRICE, VOLUME, HIGH, LOW
        ] = await res.json()
        return {
            volume: VOLUME,
            price: (BID + ASK) / 2
        }
    }

    async run() {
        const usd = await this.getPair('EOSUSD')
        return [{
            pair: 'eosusd', volume: usd.volume, price: usd.price,
        }]
    }

}
