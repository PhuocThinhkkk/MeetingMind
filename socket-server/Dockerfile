# syntax=docker/dockerfile:1
FROM golang:1.25.0

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping

EXPOSE 9090

CMD ["/docker-gs-ping"]
