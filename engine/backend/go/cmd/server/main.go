package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/pluff/pluff/engine/backend/go/internal/backend"
)

func main() {
	config, err := backend.LoadConfig()
	if err != nil {
		log.Fatalf("load configuration: %v", err)
	}

	handler, err := backend.NewHandler(config)
	if err != nil {
		log.Fatalf("initialize backend: %v", err)
	}

	server := &http.Server{
		Addr:              config.Address(),
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	stopped := make(chan os.Signal, 1)
	signal.Notify(stopped, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-stopped
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(ctx); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Printf("stop server: %v", err)
		}
	}()

	log.Printf("Pluff Go backend listening on http://%s", config.Address())
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("serve HTTP: %v", err)
	}
}
