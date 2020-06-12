package main

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"path"

	_ "github.com/mattn/go-sqlite3"
)



func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func createDBSchema(filename string) error {
	log.Printf("Database schema will be created in db %s", filename)
	db, err := sql.Open("sqlite3", dbFile)
	if err != nil {
		return fmt.Errorf("Error open database: %v", err)
	}
	sqlStmt := `create table data (id integer not null primary key, username text, data blob, base64 text);`
	_, err = db.Exec(sqlStmt)
	if err != nil {
		return fmt.Errorf("Error: %q: %s", err, sqlStmt)
	}
	return nil
}

type userData struct {
	data   []byte
	base64 string
	locked bool
}

type dbContext struct {
	db *sql.DB
}

func newDbContext() *dbContext {
	var (
		err error
	)
	if !fileExists(dbFile) {
		dir, _ := path.Split(dbFile)
		if err = os.MkdirAll(dir, 0644); err != nil {
			log.Printf("Error: %v", err)
			return nil
		}
		if err = createDBSchema(dbFile); err != nil {
			log.Printf("Error: %v", err)
			return nil
		}
	}
	log.Printf("Opening database %s", dbFile)
	db, err := sql.Open("sqlite3", dbFile)
	if err != nil {
		log.Printf("Error: %v", err)
		return nil
	}
	return &dbContext{db: db}
}

func (d *dbContext) open() (err error) {
	if d.db != nil {
		if err = d.db.Ping(); err == nil {
			return
		}
	}
	if d.db, err = sql.Open("sqlite3", dbFile); err != nil {
		err = fmt.Errorf("Error open database: %v", err)
		return
	}
	return
}

func (d *dbContext) log(format string, data ...interface{}) {
	log.Printf(format, data...)
}
func (d *dbContext) error(err error) {
	log.Printf("Error: %v", err)
}

func (d *dbContext) isUserExists(user string) (bool, error) {
	var (
		err error
		row *sql.Row
	)
	q := `SELECT EXISTS(SELECT 1 FROM data WHERE username=?)`
	row = d.db.QueryRow(q, user)
	var exists bool
	if err = row.Scan(&exists); err != nil {
		return false, err
	}
	return exists, err

}

func (d *dbContext) getData(username string) (ud userData, err error) {
	var (
		data   []byte
		base64 string
		// locked bool
	)
	row := d.db.QueryRow(`SELECT data, base64 FROM data WHERE username=? LIMIT 1`, username)
	if err = row.Scan(&data, &base64); err != nil {
		return
	}
	ud = userData{data: data, base64: base64}
	return
}

func (d *dbContext) saveData(username string, data []byte) (err error) {
	base := base64.StdEncoding.EncodeToString(data)
	var (
		q string
	)
	if exists, _ := d.isUserExists(username); exists {
		q = `UPDATE data SET data = ?, base64 = ? WHERE username = ?`
	} else {
		q = `INSERT INTO data (data, base64, username ) VALUES (?, ?, ?)`
	}
	_, err = d.db.Exec(q, data, base, username)
	return
}
