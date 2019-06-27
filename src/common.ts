import * as bunyan from 'bunyan'
import * as config from 'config'
import {Api, JsonRpc} from 'eosjs'
import {JsSignatureProvider} from 'eosjs/dist/eosjs-jssig'
import * as fetch from 'node-fetch'
import {TextDecoder, TextEncoder} from 'util'

export const rpcClient = new JsonRpc(config.get('eosio_node'), {
    fetch: fetch as any
})

export const signatureProvider = new JsSignatureProvider([
    config.get('eosio_key')
])

export const apiClient = new Api({
    rpc: rpcClient,
    chainId: config.get('eosio_chain'),
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
})

export const logger = bunyan.createLogger({
    name: config.get('name'),
    streams: (config.get('log') as any[]).map(({level, out}) => {
        if (out === 'stdout') {
            return {level, stream: process.stdout}
        } else if (out === 'stderr') {
            return {level, stream: process.stderr}
        } else {
            return {level, path: out}
        }
    })
})
