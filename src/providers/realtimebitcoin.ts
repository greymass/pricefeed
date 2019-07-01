import fetch from 'node-fetch'
import { PriceProvider } from '../price-provider'

export default class KrakenProvider implements PriceProvider {

    name = 'Realtime Bitcoin'

    async run() {
        const res = await fetch('https://realtimebitcoin.info/stats')
        if (!res.ok) {
            throw new Error('Not OK: ' + res.statusText)
        }
        const data = await res.json()
        const price = data.ticker['CNY']['15m']
        return [
            { pair: 'btccny', volume: 1, price }
        ]
    }
}
