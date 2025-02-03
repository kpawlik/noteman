package main

import (
	"database/sql"
	"fmt"

	// import postgresql
	_ "github.com/lib/pq"
)


type PostgreSQL struct{
	connectionString string
	db *DBQuery
	

}

func NewPostgreSQL(connectionString string) DB{
	return &PostgreSQL{connectionString: connectionString}
}


func (p *PostgreSQL) Open() (err error) {
	var(
		db *sql.DB
	)
	if p.db != nil {
		err = p.db.Ping()
		if err == nil {
			return
		}
	}
	db, err = sql.Open("postgres", p.connectionString)
	if err != nil {
		return
	}
	if err = db.Ping(); err != nil {
		return
	}
	p.db = &DBQuery{db}
	return
}

func (p *PostgreSQL)CreateSchema() error {
	sqlStmt := `create table data (username text, data bytea, base64 text);`
	if _, err := p.db.Exec(sqlStmt); err != nil {
		return fmt.Errorf("error: %q: %s", err, sqlStmt)
	}
	return nil
}

func (p *PostgreSQL)IsSchemaExists() bool {
	return p.db.IsSchemaExists()
}

func (p *PostgreSQL) IsUserExists(user string) (bool, error) {
	return p.db.IsUserExists(user, "$1")
}

func (p *PostgreSQL) GetData(username string) (UserData, error) {
	return p.db.GetData(username, "$1")
}

func (p *PostgreSQL) SaveData(username string, data []byte) (error) {
	return p.db.SaveData(username, data, []string{"$1", "$2", "$3"})
}