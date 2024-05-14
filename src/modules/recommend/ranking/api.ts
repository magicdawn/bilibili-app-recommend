import type { BangumiRankingItem } from './api.bangumi-category'
import type { CinemaRankingItem } from './api.cinema-category'
import type { NormalRankingItem } from './api.normal-category'
import type { Category } from './category'

export type RankingItem = NormalRankingItem | BangumiRankingItem | CinemaRankingItem

export type CategoryType = Category['type']
