package main

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"log"
)

type UserData struct {
	data   []byte
	base64 string
}

type DBQuery struct {
	*sql.DB
}

func (d *DBQuery) IsUserExists(user string, placeHolder string) (bool, error) {
	var (
		err error
		row *sql.Row
	)
	q := fmt.Sprintf(`SELECT EXISTS(SELECT 1 FROM data WHERE username=%s)`, placeHolder)
	row = d.QueryRow(q, user)
	var exists bool
	if err = row.Scan(&exists); err != nil {
		return false, err
	}
	return exists, err
}

func (d *DBQuery) IsSchemaExists() (bool) {
	var (
		err error
		row *sql.Row
	)
	q := `SELECT true FROM data limit 1`
	row = d.QueryRow(q)
	var exists bool
	if err = row.Scan(&exists); err != nil {
		if err == sql.ErrNoRows {
			return true
		}
		fmt.Println(err, sql.ErrNoRows)
		return false
	}
	return true
}

func (d *DBQuery) GetData(username string, placeHolder string) (ud UserData, err error) {
	var (
		data   []byte
		base64 string
		q string
	)
	q = fmt.Sprintf("SELECT data, base64 FROM data WHERE username=%s LIMIT 1", placeHolder)
	row := d.QueryRow(q, username)
	if err = row.Scan(&data, &base64); err != nil {
		return
	}
	ud = UserData{data: data, base64: base64}
	return
}

func (d *DBQuery) SaveData(username string, data []byte, placeHolders []string) (err error) {
	base := base64.StdEncoding.EncodeToString(data)
	var (
		q string
	)
	if exists, _ := d.IsUserExists(username, placeHolders[0]); exists {
		q = fmt.Sprintf(`UPDATE data SET data = %s, base64 = %s WHERE username = %s`, placeHolders[0], placeHolders[1], placeHolders[2])
	} else {
		q = fmt.Sprintf(`INSERT INTO data (data, base64, username ) VALUES (%s, %s, %s)`, placeHolders[0], placeHolders[1], placeHolders[2])
	}
	_, err = d.Exec(q, data, base, username)
	return
}





type DB interface {
	Open() error
	IsSchemaExists() bool
	CreateSchema() error
	IsUserExists(string) (bool, error)
	GetData(string) (UserData, error)
	SaveData(string, []byte) error
}

func newDbContext(driver, connectionString string) DB {
	contexts := map[string]func(string) DB{
		"sqlite": NewSQLite,
		"pg": NewPostgreSQL,
	}
	if db, ok := contexts[driver]; ok {
		return db(connectionString)
	}
	log.Fatalf("Unknown driver: %s", driver)
	return nil
}