export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row & Record<string, unknown>;
  Insert: Insert & Record<string, unknown>;
  Update: Update & Record<string, unknown>;
  Relationships: [];
};

export type OrganizationRole = "owner" | "admin" | "staff";
export type RoomStatus = "draft" | "scheduled" | "live" | "ended" | "cancelled";
export type NotificationType = "like" | "match";
export type ReportStatus = "pending" | "reviewed" | "dismissed" | "action_taken";

export interface ProfileRow {
  id: string;
  display_name: string;
  age: number | null;
  avatar_path: string | null;
  bio: string | null;
  intent_id: string | null;
  onboarding_completed: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRow { id: string; name: string; slug: string; created_by: string; created_at: string; updated_at: string }
export interface MembershipRow { organization_id: string; user_id: string; role: OrganizationRole; created_at: string }
export interface VenueRow { id: string; organization_id: string; name: string; address: string | null; city: string; created_at: string; updated_at: string }
export interface RoomRow { id: string; organization_id: string; venue_id: string | null; name: string; slug: string; description: string | null; start_at: string; end_at: string; status: RoomStatus; access_code: string; created_at: string; updated_at: string }
export interface PresenceRow { id: string; room_id: string; user_id: string; joined_at: string; last_seen_at: string; left_at: string | null; active: boolean }
export interface InterestRow { id: string; slug: string; label: string; active: boolean; sort_order: number; created_at: string }
export interface IntentRow { id: string; key: string; label: string; color: string; sort_order: number; active: boolean; created_at: string }
export interface LikeRow { id: string; room_id: string; from_user_id: string; to_user_id: string; created_at: string }
export interface MatchRow { id: string; room_id: string; user_one_id: string; user_two_id: string; created_at: string }
export interface NotificationRow { id: string; user_id: string; room_id: string; type: NotificationType; actor_user_id: string; read_at: string | null; created_at: string }
export interface BlockRow { id: string; blocker_user_id: string; blocked_user_id: string; created_at: string }
export interface ReasonRow { id: string; key: string; label: string; active: boolean; sort_order: number }
export interface ReportRow { id: string; reporter_user_id: string; reported_user_id: string; room_id: string; reason_id: string; description: string | null; status: ReportStatus; reviewed_by: string | null; reviewed_at: string | null; created_at: string }

export interface PublicRoom { id: string; name: string; slug: string; description: string | null; start_at: string; end_at: string; status: RoomStatus; venue_name: string | null; venue_city: string | null }
export interface DiscoveryProfile { id: string; display_name: string; age: number | null; avatar_path: string | null; bio: string | null; intent_label: string | null; intent_color: string | null; interests: Array<{ id: string; label: string }> }
export interface RoomMatch { match_id: string; matched_at: string; user_id: string; display_name: string; age: number | null; avatar_path: string | null; intent_label: string | null }
export interface ReceivedLike { like_id: string; liked_at: string; user_id: string; display_name: string; avatar_path: string | null }
export interface AppNotification { id: string; room_id: string; type: NotificationType; actor_user_id: string; actor_name: string; actor_avatar_path: string | null; read_at: string | null; created_at: string }

export type Database = {
  public: {
    Tables: {
      profile_intents: Table<IntentRow, Omit<IntentRow, "id" | "created_at"> & { id?: string; created_at?: string }>;
      interests: Table<InterestRow, Omit<InterestRow, "id" | "created_at"> & { id?: string; created_at?: string }>;
      profiles: Table<ProfileRow, Partial<ProfileRow> & { id: string }>;
      organizations: Table<OrganizationRow, Omit<OrganizationRow, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }>;
      organization_members: Table<MembershipRow, Omit<MembershipRow, "created_at"> & { created_at?: string }>;
      venues: Table<VenueRow, Omit<VenueRow, "id" | "created_at" | "updated_at"> & { id?: string; address?: string | null; created_at?: string; updated_at?: string }>;
      rooms: Table<RoomRow, Omit<RoomRow, "id" | "access_code" | "created_at" | "updated_at"> & { id?: string; access_code?: string; description?: string | null; venue_id?: string | null; created_at?: string; updated_at?: string }>;
      room_presence: Table<PresenceRow, Omit<PresenceRow, "id" | "joined_at" | "last_seen_at" | "left_at" | "active"> & { id?: string; joined_at?: string; last_seen_at?: string; left_at?: string | null; active?: boolean }>;
      profile_interests: Table<{ profile_id: string; interest_id: string; created_at: string }, { profile_id: string; interest_id: string; created_at?: string }>;
      likes: Table<LikeRow, Omit<LikeRow, "id" | "created_at"> & { id?: string; created_at?: string }>;
      matches: Table<MatchRow, Omit<MatchRow, "id" | "created_at"> & { id?: string; created_at?: string }>;
      notifications: Table<NotificationRow, Omit<NotificationRow, "id" | "read_at" | "created_at"> & { id?: string; read_at?: string | null; created_at?: string }>;
      blocks: Table<BlockRow, Omit<BlockRow, "id" | "created_at"> & { id?: string; created_at?: string }>;
      report_reasons: Table<ReasonRow, Omit<ReasonRow, "id"> & { id?: string }>;
      reports: Table<ReportRow, Omit<ReportRow, "id" | "status" | "reviewed_by" | "reviewed_at" | "created_at"> & { id?: string; status?: ReportStatus; reviewed_by?: string | null; reviewed_at?: string | null; created_at?: string }>;
    };
    Views: Record<string, never>;
    Functions: {
      create_organization: { Args: { organization_name: string; organization_slug: string }; Returns: string };
      get_public_room: { Args: { room_slug: string }; Returns: PublicRoom[] };
      join_room: { Args: { target_room_id: string }; Returns: PresenceRow };
      heartbeat_presence: { Args: { target_room_id: string }; Returns: boolean };
      leave_room: { Args: { target_room_id: string }; Returns: undefined };
      discover_room_profiles: { Args: { target_room_id: string; page_size?: number; page_offset?: number }; Returns: DiscoveryProfile[] };
      get_room_matches: { Args: { target_room_id: string }; Returns: RoomMatch[] };
      get_received_likes: { Args: { target_room_id: string }; Returns: ReceivedLike[] };
      get_my_notifications: { Args: { target_room_id?: string; result_limit?: number }; Returns: AppNotification[] };
      room_analytics: { Args: { target_room_id: string }; Returns: Json };
      organization_dashboard_metrics: { Args: { target_organization_id: string }; Returns: Json };
      is_room_active: { Args: { target_room_id: string }; Returns: boolean };
      complete_onboarding: { Args: { profile_name: string; profile_age: number; profile_bio: string; profile_intent_id: string; selected_interest_ids: string[]; new_avatar_path?: string | null }; Returns: ProfileRow };
    };
    Enums: { organization_role: OrganizationRole; room_status: RoomStatus; notification_type: NotificationType; report_status: ReportStatus };
    CompositeTypes: Record<string, never>;
  };
};
