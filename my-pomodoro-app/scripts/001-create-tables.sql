-- Tabla: tasks
-- Corresponde a la interfaz Task
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  total_pomodoros INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: pomodoro_records
-- Corresponde a la interfaz PomodoroRecord
CREATE TABLE IF NOT EXISTS pomodoro_records (
  id SERIAL PRIMARY KEY,
  task_id INTEGER,  -- referencia a tasks.id
  task_title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('work', 'shortBreak', 'longBreak')),
  completed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: pomodoro_settings
-- Corresponde a la interfaz PomodoroSettings
-- Solo se guarda la configuración actual (1 fila)
CREATE TABLE IF NOT EXISTS pomodoro_settings (
  id SERIAL PRIMARY KEY,
  work_time INTEGER NOT NULL,
  short_break INTEGER NOT NULL,
  long_break INTEGER NOT NULL,
  long_break_interval INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);