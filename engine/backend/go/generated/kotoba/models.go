package kotoba

const ModuleName = "kotoba"

type Profile struct {
	AvatarColor  string  `json:"avatar_color" db:"avatar_color"`
	BestStreak   int64   `json:"best_streak" db:"best_streak"`
	Bio          *string `json:"bio" db:"bio"`
	Country      *string `json:"country" db:"country"`
	DailyGoal    int64   `json:"daily_goal" db:"daily_goal"`
	DisplayName  string  `json:"display_name" db:"display_name"`
	Id           int64   `json:"id" db:"id"`
	Interests    *string `json:"interests" db:"interests"`
	LastActive   *string `json:"last_active" db:"last_active"`
	LearningLang string  `json:"learning_lang" db:"learning_lang"`
	Level        string  `json:"level" db:"level"`
	MessagesSent int64   `json:"messages_sent" db:"messages_sent"`
	NativeLang   string  `json:"native_lang" db:"native_lang"`
	Onboarded    bool    `json:"onboarded" db:"onboarded"`
	Streak       int64   `json:"streak" db:"streak"`
	UserId       int64   `json:"user_id" db:"user_id"`
	WordsWritten int64   `json:"words_written" db:"words_written"`
	Xp           int64   `json:"xp" db:"xp"`
	CreatedAt    string  `json:"created_at" db:"created_at"`
	UpdatedAt    string  `json:"updated_at" db:"updated_at"`
}

type Post struct {
	AuthorColor      *string `json:"author_color" db:"author_color"`
	AuthorName       string  `json:"author_name" db:"author_name"`
	AuthorNative     *string `json:"author_native" db:"author_native"`
	Body             string  `json:"body" db:"body"`
	CommentsCount    int64   `json:"comments_count" db:"comments_count"`
	CorrectionsCount int64   `json:"corrections_count" db:"corrections_count"`
	Id               int64   `json:"id" db:"id"`
	Kind             string  `json:"kind" db:"kind"`
	Lang             string  `json:"lang" db:"lang"`
	LikesCount       int64   `json:"likes_count" db:"likes_count"`
	MissionId        *int64  `json:"mission_id" db:"mission_id"`
	Translation      *string `json:"translation" db:"translation"`
	UserId           int64   `json:"user_id" db:"user_id"`
	CreatedAt        string  `json:"created_at" db:"created_at"`
	UpdatedAt        string  `json:"updated_at" db:"updated_at"`
}

type Comment struct {
	Accepted     bool    `json:"accepted" db:"accepted"`
	AuthorColor  *string `json:"author_color" db:"author_color"`
	AuthorName   string  `json:"author_name" db:"author_name"`
	Body         string  `json:"body" db:"body"`
	Corrected    *string `json:"corrected" db:"corrected"`
	Explanation  *string `json:"explanation" db:"explanation"`
	Id           int64   `json:"id" db:"id"`
	IsCorrection bool    `json:"is_correction" db:"is_correction"`
	PostId       int64   `json:"post_id" db:"post_id"`
	UserId       int64   `json:"user_id" db:"user_id"`
	CreatedAt    string  `json:"created_at" db:"created_at"`
	UpdatedAt    string  `json:"updated_at" db:"updated_at"`
}

type Like struct {
	Id        int64  `json:"id" db:"id"`
	PostId    int64  `json:"post_id" db:"post_id"`
	UserId    int64  `json:"user_id" db:"user_id"`
	CreatedAt string `json:"created_at" db:"created_at"`
	UpdatedAt string `json:"updated_at" db:"updated_at"`
}

type Follow struct {
	FollowerId  int64  `json:"follower_id" db:"follower_id"`
	FollowingId int64  `json:"following_id" db:"following_id"`
	Id          int64  `json:"id" db:"id"`
	CreatedAt   string `json:"created_at" db:"created_at"`
	UpdatedAt   string `json:"updated_at" db:"updated_at"`
}

type Mission struct {
	Hint      *string `json:"hint" db:"hint"`
	Id        int64   `json:"id" db:"id"`
	Lang      string  `json:"lang" db:"lang"`
	Level     string  `json:"level" db:"level"`
	Position  int64   `json:"position" db:"position"`
	Prompt    string  `json:"prompt" db:"prompt"`
	Title     string  `json:"title" db:"title"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

type Lesson struct {
	Content   string  `json:"content" db:"content"`
	Emoji     *string `json:"emoji" db:"emoji"`
	Id        int64   `json:"id" db:"id"`
	Lang      string  `json:"lang" db:"lang"`
	Level     string  `json:"level" db:"level"`
	Position  int64   `json:"position" db:"position"`
	Title     string  `json:"title" db:"title"`
	Unit      string  `json:"unit" db:"unit"`
	Xp        int64   `json:"xp" db:"xp"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

type LessonResult struct {
	Best      int64  `json:"best" db:"best"`
	Id        int64  `json:"id" db:"id"`
	LessonId  int64  `json:"lesson_id" db:"lesson_id"`
	Score     int64  `json:"score" db:"score"`
	UserId    int64  `json:"user_id" db:"user_id"`
	CreatedAt string `json:"created_at" db:"created_at"`
	UpdatedAt string `json:"updated_at" db:"updated_at"`
}

type VocabCard struct {
	DueDate      *string `json:"due_date" db:"due_date"`
	Ease         float64 `json:"ease" db:"ease"`
	Example      *string `json:"example" db:"example"`
	Id           int64   `json:"id" db:"id"`
	IntervalDays int64   `json:"interval_days" db:"interval_days"`
	Lang         string  `json:"lang" db:"lang"`
	Lapses       int64   `json:"lapses" db:"lapses"`
	Meaning      string  `json:"meaning" db:"meaning"`
	Reps         int64   `json:"reps" db:"reps"`
	Source       string  `json:"source" db:"source"`
	Term         string  `json:"term" db:"term"`
	UserId       int64   `json:"user_id" db:"user_id"`
	CreatedAt    string  `json:"created_at" db:"created_at"`
	UpdatedAt    string  `json:"updated_at" db:"updated_at"`
}

type Conversation struct {
	Id          int64   `json:"id" db:"id"`
	LastAt      *string `json:"last_at" db:"last_at"`
	LastMessage *string `json:"last_message" db:"last_message"`
	UserA       int64   `json:"user_a" db:"user_a"`
	UserB       int64   `json:"user_b" db:"user_b"`
	CreatedAt   string  `json:"created_at" db:"created_at"`
	UpdatedAt   string  `json:"updated_at" db:"updated_at"`
}

type Message struct {
	Body           string  `json:"body" db:"body"`
	CircleId       *int64  `json:"circle_id" db:"circle_id"`
	ConversationId *int64  `json:"conversation_id" db:"conversation_id"`
	Corrected      *string `json:"corrected" db:"corrected"`
	CorrectedBy    *int64  `json:"corrected_by" db:"corrected_by"`
	Id             int64   `json:"id" db:"id"`
	Lang           *string `json:"lang" db:"lang"`
	Note           *string `json:"note" db:"note"`
	SenderColor    *string `json:"sender_color" db:"sender_color"`
	SenderId       int64   `json:"sender_id" db:"sender_id"`
	SenderName     string  `json:"sender_name" db:"sender_name"`
	CreatedAt      string  `json:"created_at" db:"created_at"`
	UpdatedAt      string  `json:"updated_at" db:"updated_at"`
}

type Circle struct {
	Description  *string `json:"description" db:"description"`
	Emoji        string  `json:"emoji" db:"emoji"`
	Id           int64   `json:"id" db:"id"`
	Lang         string  `json:"lang" db:"lang"`
	Level        string  `json:"level" db:"level"`
	MembersCount int64   `json:"members_count" db:"members_count"`
	Name         string  `json:"name" db:"name"`
	OwnerId      int64   `json:"owner_id" db:"owner_id"`
	WeeklyGoal   int64   `json:"weekly_goal" db:"weekly_goal"`
	CreatedAt    string  `json:"created_at" db:"created_at"`
	UpdatedAt    string  `json:"updated_at" db:"updated_at"`
}

type CircleMember struct {
	CircleId  int64  `json:"circle_id" db:"circle_id"`
	Id        int64  `json:"id" db:"id"`
	UserId    int64  `json:"user_id" db:"user_id"`
	CreatedAt string `json:"created_at" db:"created_at"`
	UpdatedAt string `json:"updated_at" db:"updated_at"`
}

type Alert struct {
	Id        int64  `json:"id" db:"id"`
	IsRead    bool   `json:"is_read" db:"is_read"`
	Kind      string `json:"kind" db:"kind"`
	Ref       *int64 `json:"ref" db:"ref"`
	Text      string `json:"text" db:"text"`
	UserId    int64  `json:"user_id" db:"user_id"`
	CreatedAt string `json:"created_at" db:"created_at"`
	UpdatedAt string `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Profile", "Post", "Comment", "Like", "Follow", "Mission", "Lesson", "LessonResult", "VocabCard", "Conversation", "Message", "Circle", "CircleMember", "Alert"}
