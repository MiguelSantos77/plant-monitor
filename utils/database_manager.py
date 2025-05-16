import sqlite3

class DatabaseManager:
    def __init__(self, db_name):
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
            "infos",
            "id INTEGER PRIMARY KEY AUTOINCREMENT, humidity INT NOT NULL, lastWatering TEXT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
        )
    
    def insert_info(self, humidity, lastWatering):
        self.cursor.execute("INSERT INTO infos (humidity, lastWatering) VALUES (?, ?) ", (humidity, lastWatering))
        self.conn.commit()

    def get_all_infos(self):
        self.cursor.execute("SELECT * FROM infos ORDER BY id DESC")
        return self.cursor.fetchall()

    def get_latest_info(self):
        self.cursor.execute("SELECT * FROM infos ORDER BY id DESC LIMIT 1")
        return self.cursor.fetchone()
    
    def custom_sql_query(self, sql):
        self.cursor.execute(sql)
        return self.cursor.fetchall()
    
    def close(self):
        if self.conn:
            self.conn.close()