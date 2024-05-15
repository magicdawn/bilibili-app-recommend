import type { BangumiRankingItem } from './api.bangumi-category'
import type { CinemaRankingItem } from './api.cinema-category'
import type { NormalRankingItem } from './api.normal-category'

export type RankingItem = NormalRankingItem | BangumiRankingItem | CinemaRankingItem
