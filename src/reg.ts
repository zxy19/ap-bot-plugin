import { Context } from 'koishi'
import { registerChar } from './features/char'
import { registerChip } from './features/chip'
import { registerGame } from './features/game'
import { registerUid } from './features/uid'
import { registerWatch } from './features/watch'
import { registerRandomMap } from './features/randomMap'

type FeatureRegister = (ctx: Context) => void

const features: FeatureRegister[] = [
  registerChar,
  registerChip,
  registerGame,
  registerUid,
  registerWatch,
  registerRandomMap,
]

export function registerAll(ctx: Context) {
  features.forEach(f => f(ctx))
}
