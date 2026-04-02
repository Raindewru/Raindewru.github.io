CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER,
    school TEXT,
    region TEXT,
    school_category TEXT,
    college TEXT,
    major_code TEXT,
    major_name TEXT,
    study_form TEXT,
    student_id TEXT,
    total_score INTEGER,
    first_choice_school TEXT,
    remark TEXT
);

CREATE INDEX IF NOT EXISTS idx_year ON students(year);
CREATE INDEX IF NOT EXISTS idx_school ON students(school);
CREATE INDEX IF NOT EXISTS idx_region ON students(region);
CREATE INDEX IF NOT EXISTS idx_major_code ON students(major_code);
CREATE INDEX IF NOT EXISTS idx_total_score ON students(total_score);
CREATE INDEX IF NOT EXISTS idx_first_choice_school ON students(first_choice_school);