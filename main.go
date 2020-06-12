package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"flag"
)

var (
	port string
	dbFile string
)

func init() {
	var (
		db *dbContext
	)
	flag.StringVar(&dbFile, "dbFile", "./db/noteman.db", "Database file path")
	flag.StringVar(&port, "port", "9991", "Port number")
	flag.Parse()
	// init static file server
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	// init database
	if db = newDbContext(); db == nil {
		panic("Cannot connect to database")
	}
	// init handlers
	http.Handle("/data", newHandler(getDataHandler, db))
	http.Handle("/save", newHandler(saveDataHandler, db))
	http.Handle("/", newHandler(indexHandler, db))
}

// JSONMap wrapper for JSON object
type JSONMap map[string]interface{}

// JSONMapArray array of JSONMap objects
type JSONMapArray []JSONMap

type handlerFunc func(http.ResponseWriter, *http.Request, *dbContext) error

// handler is a wrapper for HTTP handler function
type handler struct {
	f  handlerFunc
	db *dbContext
}

// NewHandler creates new handler instance
func newHandler(f handlerFunc, db *dbContext) *handler {
	return &handler{f, db}
}

func (h *handler) err(w http.ResponseWriter, r *http.Request, err error) {

	context := JSONMap{"error": err.Error()}
	jsonWr := json.NewEncoder(w)
	jsonWr.Encode(context)
}

func (h *handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var (
		err error
	)
	if err = h.db.open(); err != nil {
		h.err(w, r, err)
		return
	}
	if err = h.f(w, r, h.db); err != nil {
		h.err(w, r, err)
		return
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request, db *dbContext) error {
	templates, err := template.ParseFiles("templates/index.html")
	if err != nil {
		return err
	}
	return templates.ExecuteTemplate(w, "index", nil)
}

func getDataHandler(w http.ResponseWriter, r *http.Request, db *dbContext) (err error) {
	results := make(JSONMap)
	w.Header().Add("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Add("Pragma", "no-cache")
	w.Header().Add("Expires", "0")
	jsonWr := json.NewEncoder(w)
	if result, err := getData(w, r, db); err != nil {
		results["error"] = err.Error()
	} else {
		results["userData"] = result
	}
	jsonWr.Encode(results)

	return
}
func getData(w http.ResponseWriter, r *http.Request, db *dbContext) (result JSONMapArray, err error) {
	var (
		exists     bool
		udata      userData
		stringData string
	)
	name, pswd := r.FormValue("name"), r.FormValue("pswd")
	if exists, err = db.isUserExists(name); err != nil {
		db.error(err)
		return
	}
	if !exists {
		return
	}
	if udata, err = db.getData(name); err != nil {
		return
	}
	if stringData, err = decrypt(udata.data, pswd); err != nil {
		return
	}
	// this will check if data were correctly decrypted
	if err = json.Unmarshal([]byte(stringData), &result); err != nil {
		err = fmt.Errorf("Wrong password")
		return
	}
	return
}

func saveDataHandler(w http.ResponseWriter, r *http.Request, db *dbContext) (err error) {
	results := make(JSONMap)
	jsonWr := json.NewEncoder(w)
	if result, err := saveData(w, r, db); err != nil {
		results["error"] = err.Error()
	} else {
		results["userData"] = result
	}
	jsonWr.Encode(results)
	return
}
func saveData(w http.ResponseWriter, r *http.Request, db *dbContext) (result JSONMapArray, err error) {
	var (
		data []byte
	)

	name := r.FormValue("name")
	pswd := r.FormValue("pswd")
	stringData := r.FormValue("data")
	if err = json.Unmarshal([]byte(stringData), &result); err != nil {
		err = fmt.Errorf("Wrong password")
		return
	}
	if data, err = encrypt(stringData, pswd); err != nil {
		db.log(err.Error())
		return
	}
	err = db.saveData(name, data)
	return
}

func main() {
	log.Printf("Listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
