/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Workaround for undefined typings in eosjs, not sure what's going on here
// Prob related to them using dependency injection for the encoder and fetch libraries
interface Request {}
interface RequestInit {}
interface Response {}
interface TextDecoder {}
interface TextEncoder {}
