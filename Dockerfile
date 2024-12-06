FROM golang:1.23.4-alpine3.20 AS golang

WORKDIR /app
COPY go.mod go.sum ./
COPY *.go ./
COPY static/ ./static/
COPY templates/ ./templates/

RUN go mod tidy &&  go build -o noteman

FROM alpine:3.20
RUN mkdir -p /noteman/db
COPY --from=golang /app/noteman /noteman/noteman
COPY --from=golang /app/static /noteman/static
COPY --from=golang /app/templates /noteman/templates

EXPOSE 8080

ENTRYPOINT ["/noteman/noteman", "-port", "8080", "-dbFile", "/noteman/db/notman.db"]
