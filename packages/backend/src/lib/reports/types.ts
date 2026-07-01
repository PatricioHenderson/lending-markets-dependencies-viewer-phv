export interface Report<TAnchors extends object = object, TModifiers extends object = object> {
  chain: string
  marketId: string
  anchors: TAnchors
  modifiers: TModifiers
  [key: string]: unknown
}
