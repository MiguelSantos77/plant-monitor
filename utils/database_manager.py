import sqlite3

class DatabaseManager:
    def __init__(self, db_name= 'database.db'):
        self.db_name = db_name
        self.conn = None
        self.cursor = None
        self.connect()
        self.create_default_tables()

    def connect(self):
        self.conn = sqlite3.connect(self.db_name)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()

    def create_table(self, table_name, fields):
        query = f"CREATE TABLE IF NOT EXISTS {table_name} ({fields})"
        self.cursor.execute(query)
        self.conn.commit()

    def create_default_tables(self):
        self.create_table(
            "humidityHistory",
            "id INTEGER PRIMARY KEY AUTOINCREMENT, humidity INTEGER NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
        )
        
        self.create_table(
            "lastWateringHistory",
            "id INTEGER PRIMARY KEY AUTOINCREMENT, duration TEXT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
        )
        self.create_table(
            "tankStatusHistory",
            "id INTEGER PRIMARY KEY AUTOINCREMENT, state INTEGER NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
        )
        
        self.create_table(
            "settings",
            """
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            broker_ip TEXT,
            broker_port TEXT,
            max_sensor INTEGER,
            min_sensor INTEGER,
            mode TEXT,
            min_humidity INTEGER,
            max_humidity INTEGER,
            heat_alert_manual INTEGER DEFAULT 0,
            heat_alert_auto INTEGER DEFAULT 0,
            heat_alert_schedule INTEGER DEFAULT 0,
            schedule_times TEXT,
            timezone TEXT,
            duration INTEGER,
            max_temperature FLOAT,
            latitude TEXT,
            longitude TEXT
            """
        )
        self.cursor.execute("SELECT COUNT(*) FROM settings")
        count = self.cursor.fetchone()[0]
        if count == 0:
            self.cursor.execute("""
                INSERT INTO settings (
                    mode, heat_alert_manual, min_humidity, max_humidity,
                    heat_alert_auto, schedule_times, heat_alert_schedule
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, ("manual", 0, 10, 30, 0, "[]", 0))
        self.conn.commit()

    def insert_humidity(self, humidity):
        self.cursor.execute("INSERT INTO humidityHistory (humidity) VALUES (?)", (humidity,))
        self.conn.commit()

    def insert_last_watering(self, duration):
        self.cursor.execute("INSERT INTO lastWateringHistory (duration) VALUES (?)", (duration,))
        self.conn.commit()

    def insert_tank_status(self, state):
        self.cursor.execute("INSERT INTO tankStatusHistory (state) VALUES (?)", (state,))
        self.conn.commit()
    
    def get_all_humidity(self):
        self.cursor.execute("SELECT * FROM humidityHistory ORDER BY id DESC")
        return self.cursor.fetchall()

    def get_all_last_watering(self):
        self.cursor.execute("SELECT * FROM lastWateringHistory ORDER BY id DESC")
        return self.cursor.fetchall()

    def get_all_tank_status(self):
        self.cursor.execute("SELECT * FROM tankStatusHistory ORDER BY id DESC")
        return self.cursor.fetchall()
        
    def get_latest_humidity(self):
        self.cursor.execute("SELECT * FROM humidityHistory ORDER BY id DESC LIMIT 1")
        return self.cursor.fetchone()

    def get_latest_last_watering(self):
        self.cursor.execute("SELECT * FROM lastWateringHistory ORDER BY id DESC LIMIT 1")
        return self.cursor.fetchone()

    def get_latest_tank_status(self):
        self.cursor.execute("SELECT * FROM tankStatusHistory ORDER BY id DESC LIMIT 1")
        return self.cursor.fetchone()
        
    def get_settings(self):
        self.cursor.execute("SELECT * FROM settings LIMIT 1")
        row = self.cursor.fetchone()
        if row:
            return dict(row)
        return None

    def update_settings(self, data):
        columns = []
        values = []
        for key, value in data.items():
            columns.append(f"{key} = ?")
            values.append(value)
        values.append(1)
        query = f"UPDATE settings SET {', '.join(columns)} WHERE id = ?"
        self.cursor.execute(query, values)
        self.conn.commit()

    def custom_sql_query(self, sql):
        self.cursor.execute(sql)
        return self.cursor.fetchall()

    def close(self):
        if self.conn:
            self.conn.close()