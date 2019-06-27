import fetch from 'node-fetch'
import { PriceProvider } from '../price-provider'

export default class KrakenProvider implements PriceProvider {

    name = 'Kraken'

    async getPair(name: string) {
        const res = await fetch(`https://api.kraken.com/0/public/Ticker\?pair\=${ name }`)
        if (!res.ok) {
            throw new Error('Not OK: ' + res.statusText)
        }
        const data = await res.json()
        if (data.error && data.error.length > 0) {
            throw new Error('Kraken error: ' + data.error.join(', '))
        }
        return {
            volume: parseFloat(data.result[name].v[1]),
            price: (parseFloat(data.result[name].b[0]) + parseFloat(data.result[name].a[0])) / 2
        }
    }

    async run() {
        const usd = await this.getPair('EOSUSD')
        return [{
            pair: 'eosusd', volume: usd.volume, price: usd.price,
        }]
    }

}
