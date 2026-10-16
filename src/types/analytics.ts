export interface DistributionItem { label: string | null; value: number }
export interface RoomAnalytics { total_attendees: number; active_now: number; max_concurrent: number; age_distribution: DistributionItem[]; top_interests: DistributionItem[]; intent_distribution: DistributionItem[]; peak_hour: string | null }
