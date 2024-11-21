import type { BangumiRankingItem } from './bangumi-category'
import type { CinemaRankingItem } from './cinema-category'
import type { NormalRankingItem } from './normal-category'

export { BangumiRankingItem, CinemaRankingItem, NormalRankingItem }

export type RankingItem = NormalRankingItem | BangumiRankingItem | CinemaRankingItem
