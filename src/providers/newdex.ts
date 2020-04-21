//

import fetch from 'node-fetch'
import { PriceProvider } from '../price-provider'

export default class NewdexProvider implements PriceProvider {

    name = 'Newdex'

    async getPair(name: string) {
        const res = await fetch(`https://api.newdex.io/v1/ticker?symbol=${name}`)
        if (!res.ok) {
            throw new Error('Not OK: ' + res.statusText)
        }
        const result = await res.json()
        if (result.code && result.code === 501) {
            throw new Error('Newdex error: ' + result.error.join(', '))
        }
        return {
            volume: parseFloat(result.data.volume),
            price: parseFloat(result.data.last),
        }
    }

    async run() {
        const [emt, vig] = await Promise.all([
            this.getPair('emanateoneos-emt-eos'),
            this.getPair('vig111111111-vig-eos'),
        ])
        return [
            { pair: 'emteos', volume: emt.volume, price: emt.price },
            { pair: 'vigeos', volume: vig.volume, price: vig.price * 1e4 },
        ]
    }
}
