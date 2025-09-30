/**
 * Canvas API Type Definitions
 * Based on Canvas LMS API documentation
 */

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  workflow_state: 'available' | 'unpublished' | 'completed' | 'deleted';
  uuid: string;
  start_at?: string;
  end_at?: string;
  created_at: string;
  updated_at: string;
  enrollment_term_id: number;
  is_public: boolean;
  is_favorite?: boolean;
  apply_assignment_group_weights: boolean;
  calendar?: {
    ics: string;
  };
  course_color?: string;
  friendly_name?: string;
  account_id: number;
  enrollments?: CanvasEnrollment[];
  term?: CanvasTerm;
  teachers?: CanvasUser[];
  avatar_url?: string;
  banner_image_url?: string;
}

export interface CanvasEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  type: 'StudentEnrollment' | 'TeacherEnrollment' | 'TaEnrollment' | 'ObserverEnrollment';
  enrollment_state: 'active' | 'invited' | 'inactive' | 'completed' | 'rejected' | 'deleted';
  role: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  start_at?: string;
  end_at?: string;
  course_section_id: number;
  root_account_id: number;
  limit_privileges_to_course_section: boolean;
  grades?: {
    html_url: string;
    current_score?: number;
    final_score?: number;
    current_grade?: string;
    final_grade?: string;
  };
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  due_at?: string;
  lock_at?: string;
  unlock_at?: string;
  course_id: number;
  html_url: string;
  submissions_download_url?: string;
  assignment_group_id: number;
  allowed_extensions?: string[];
  turnitin_enabled: boolean;
  vericite_enabled: boolean;
  turnitin_settings?: any;
  grade_group_students_individually: boolean;
  external_tool_tag_attributes?: any;
  peer_reviews: boolean;
  automatic_peer_reviews: boolean;
  peer_review_count: number;
  peer_reviews_assign_at?: string;
  intra_group_peer_reviews: boolean;
  group_category_id?: number;
  needs_grading_count: number;
  needs_grading_count_by_section?: any[];
  position: number;
  post_to_sis: boolean;
  integration_id?: string;
  integration_data?: any;
  muted: boolean;
  points_possible?: number;
  submission_types: string[];
  has_submitted_submissions: boolean;
  grading_type: 'pass_fail' | 'percent' | 'letter_grade' | 'gpa_scale' | 'points';
  grading_standard_id?: number;
  published: boolean;
  unpublishable: boolean;
  only_visible_to_overrides: boolean;
  locked_for_user: boolean;
  submissions?: CanvasSubmission[];
  assignment_visibility?: number[];
  overrides?: any[];
  omit_from_final_grade: boolean;
  rubric?: CanvasRubric[];
  rubric_settings?: any;
  hide_in_gradebook: boolean;
  lock_info?: any;
  quiz_id?: number;
  anonymous_submissions: boolean;
  discussion_topic?: any;
  freeze_on_copy: boolean;
  frozen: boolean;
  frozen_attributes?: string[];
  submission?: CanvasSubmission;
}

export interface CanvasSubmission {
  id: number;
  user_id: number;
  assignment_id: number;
  submitted_at?: string;
  score?: number;
  grade?: string;
  attempt: number;
  body?: string;
  grade_matches_current_submission: boolean;
  html_url: string;
  preview_url: string;
  graded_at?: string;
  grader_id?: number;
  excused: boolean;
  late: boolean;
  missing: boolean;
  late_policy_status?: string;
  points_deducted?: number;
  seconds_late: number;
  workflow_state: 'graded' | 'submitted' | 'unsubmitted' | 'pending_review';
  extra_attempts?: number;
  anonymous_id?: string;
  posted_at?: string;
  read_status?: string;
  redo_request: boolean;
  submission_type?: string;
  url?: string;
  attachments?: CanvasFile[];
  submission_comments?: CanvasSubmissionComment[];
}

export interface CanvasSubmissionComment {
  id: number;
  author_id: number;
  author_name: string;
  comment: string;
  created_at: string;
  edited_at?: string;
  media_comment?: any;
  attachments?: CanvasFile[];
}

export interface CanvasModule {
  id: number;
  workflow_state: 'active' | 'deleted';
  position: number;
  name: string;
  unlock_at?: string;
  require_sequential_progress: boolean;
  prerequisite_module_ids: number[];
  items_count: number;
  items_url: string;
  items?: CanvasModuleItem[];
  state?: 'locked' | 'unlocked' | 'started' | 'completed';
  completed_at?: string;
  publish_final_grade: boolean;
  published: boolean;
}

export interface CanvasModuleItem {
  id: number;
  module_id: number;
  position: number;
  title: string;
  indent: number;
  type: 'File' | 'Page' | 'Discussion' | 'Assignment' | 'Quiz' | 'SubHeader' | 'ExternalUrl' | 'ExternalTool';
  content_id?: number;
  html_url?: string;
  url?: string;
  page_url?: string;
  external_url?: string;
  new_tab?: boolean;
  completion_requirement?: {
    type: 'must_view' | 'must_submit' | 'must_contribute' | 'min_score';
    min_score?: number;
    completed: boolean;
  };
  content_details?: {
    points_possible?: number;
    due_at?: string;
    unlock_at?: string;
    lock_at?: string;
  };
  published: boolean;
}

export interface CanvasFile {
  id: number;
  uuid: string;
  folder_id: number;
  display_name: string;
  filename: string;
  upload_status: 'success' | 'pending' | 'failed';
  content_type: string;
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
  unlock_at?: string;
  locked: boolean;
  hidden: boolean;
  lock_at?: string;
  hidden_for_user: boolean;
  thumbnail_url?: string;
  modified_at: string;
  mime_class: string;
  media_entry_id?: string;
  locked_for_user: boolean;
  lock_info?: any;
  lock_explanation?: string;
  preview_url?: string;
}

export interface CanvasPage {
  url: string;
  title: string;
  created_at: string;
  updated_at: string;
  hide_from_students: boolean;
  editing_roles: string;
  last_edited_by?: CanvasUser;
  body?: string;
  published: boolean;
  front_page: boolean;
  locked_for_user: boolean;
  lock_info?: any;
  lock_explanation?: string;
  page_id: number;
  html_url: string;
}

export interface CanvasDiscussion {
  id: number;
  title: string;
  message?: string;
  html_url: string;
  posted_at: string;
  last_reply_at?: string;
  require_initial_post: boolean;
  user_can_see_posts: boolean;
  discussion_subentry_count: number;
  read_state: 'read' | 'unread';
  unread_count: number;
  subscribed: boolean;
  subscription_hold?: string;
  assignment_id?: number;
  delayed_post_at?: string;
  published: boolean;
  lock_at?: string;
  locked: boolean;
  pinned: boolean;
  locked_for_user: boolean;
  lock_info?: any;
  lock_explanation?: string;
  user_name?: string;
  topic_children?: number[];
  group_topic_children?: any[];
  root_topic_id?: number;
  podcast_url?: string;
  discussion_type: 'side_comment' | 'threaded' | 'flat';
  group_category_id?: number;
  attachments?: CanvasFile[];
  permissions: {
    attach: boolean;
    update: boolean;
    reply: boolean;
    delete: boolean;
  };
  allow_rating: boolean;
  only_graders_can_rate: boolean;
  sort_by_rating: boolean;
}

export interface CanvasUser {
  id: number;
  name: string;
  sortable_name: string;
  short_name: string;
  sis_user_id?: string;
  integration_id?: string;
  sis_import_id?: number;
  login_id?: string;
  avatar_url?: string;
  enrollments?: CanvasEnrollment[];
  email?: string;
  locale?: string;
  last_login?: string;
  time_zone?: string;
  bio?: string;
}

export interface CanvasTerm {
  id: number;
  name: string;
  start_at?: string;
  end_at?: string;
  workflow_state: 'active' | 'deleted';
  created_at: string;
  sis_term_id?: string;
  sis_import_id?: number;
  grading_period_group_id?: number;
}

export interface CanvasCalendarEvent {
  id: number;
  title: string;
  start_at: string;
  end_at?: string;
  description?: string;
  location_name?: string;
  location_address?: string;
  context_code: string;
  effective_context_code?: string;
  workflow_state: 'active' | 'locked' | 'deleted';
  hidden: boolean;
  parent_event_id?: number;
  child_events_count: number;
  child_events?: CanvasCalendarEvent[];
  url?: string;
  html_url: string;
  all_day_date?: string;
  all_day: boolean;
  created_at: string;
  updated_at: string;
  appointment_group_id?: number;
  appointment_group_url?: string;
  own_reservation: boolean;
  reserve_url?: string;
  reserved: boolean;
  participant_type?: 'User' | 'Group';
  participants_per_appointment?: number;
  available_slots?: number;
  user?: CanvasUser;
  group?: any;
  important_dates: boolean;
  series_uuid?: string;
  rrule?: string;
}

export interface CanvasGrade {
  assignment_id: number;
  student_id: number;
  assignment_group_id: number;
  assignment_group_weight: number;
  current_grade?: string;
  current_score?: number;
  final_grade?: string;
  final_score?: number;
  multiple_grading_periods_enabled: boolean;
  totals_for_all_grading_periods_option: boolean;
  current_grading_period_id?: number;
  current_grading_period_title?: string;
  grades?: {
    [gradingPeriodId: string]: {
      grade?: string;
      score?: number;
    };
  };
}

// Search and Analysis Types
export interface SearchResult {
  type: 'course' | 'assignment' | 'module' | 'page' | 'file' | 'discussion';
  id: number;
  title: string;
  course_id: number;
  course_name: string;
  url: string;
  description?: string;
  relevance_score: number;
  content_snippet?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentAnalysis {
  total_courses: number;
  total_assignments: number;
  upcoming_assignments: number;
  overdue_assignments: number;
  average_grade?: number;
  completion_rate: number;
  last_activity: string;
  trends: {
    assignments_by_week: { week: string; count: number }[];
    grade_progression: { date: string; average: number }[];
    activity_heatmap: { date: string; activity_count: number }[];
  };
}

// Cache and Performance Types
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

export interface APIResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  cached: boolean;
  requestId: string;
  timestamp: number;
}

// Error Types
export interface CanvasAPIError {
  message: string;
  error_code?: string;
  status: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Rubric Types
export interface CanvasRubric {
  id: string;
  points: number;
  description: string;
  long_description?: string;
  criterion_use_range?: boolean;
  ratings?: CanvasRubricRating[];
}

export interface CanvasRubricRating {
  id: string;
  criterion_id: string;
  description: string;
  long_description?: string;
  points: number;
}