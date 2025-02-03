package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path"

	_ "modernc.org/sqlite"
)

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

type SQLite struct{
	db *DBQuery
	connectionString string
	placeHoler string
	
}

func NewSQLite(connectionString string) DB{
	return &SQLite{connectionString: connectionString, placeHoler: "?"}
}


func (s *SQLite) Open() (err error) {
	var(
		db *sql.DB
	)
	if !fileExists(s.connectionString) {
		dir, _ := path.Split(s.connectionString)
		if err = os.MkdirAll(dir, 0644); err != nil {
			log.Printf("Error: %v", err)
			return nil
		}
	}
	if s.db != nil {
		if err = s.db.Ping(); err == nil {
			return
		}
	}
	if db, err = sql.Open("sqlite", connectionString); err != nil {
		err = fmt.Errorf("error open database: %v", err)
		return
	}
	s.db = &DBQuery{db}
	return
}

func (s *SQLite)IsSchemaExists() bool {
	return s.db.IsSchemaExists()
}

func (s *SQLite)CreateSchema() error {
	sqlStmt := `create table data ( username text, data blob, base64 text);`
	if _, err := s.db.Exec(sqlStmt); err != nil {
		return fmt.Errorf("error: %q: %s", err, sqlStmt)
	}
	return nil
}




func (s *SQLite) IsUserExists(user string) (bool, error) {
	return s.db.IsUserExists(user, s.placeHoler)
}

func (s *SQLite) GetData(username string) (UserData, error) {
	return s.db.GetData(username, s.placeHoler)
}

func (s *SQLite) SaveData(username string, data []byte) (error) {
	return s.db.SaveData(username, data, []string{s.placeHoler, s.placeHoler, s.placeHoler})
}
