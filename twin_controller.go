// Copyright 2018 NTT Group

// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the following
// conditions:

// The above copyright notice and this permission notice shall be included in all copies
// or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

package main

import (
	"encoding/json"
	"net/http"

	anki "github.com/okoeth/edge-anki-base"
	"github.com/okoeth/muxlogger"

	"goji.io"
	"goji.io/pat"
)

type (
	// TwinController represents the controller for working with this app
	TwinController struct {
		track []anki.Status
		cmdCh chan anki.Command
	}
)

// NewTwinController provides a reference to an IncomingController
func NewTwinController(t []anki.Status, ch chan anki.Command) *TwinController {
	return &TwinController{track: t, cmdCh: ch}
}

// AddHandlers inserts new greeting
func (tc *TwinController) AddHandlers(mux *goji.Mux) {
	mux.HandleFunc(pat.Get("/v1/twin/status"), tc.GetStatus) // Omitting logger for GetStatus
	mux.HandleFunc(pat.Post("/v1/twin/command"), muxlogger.Logger(mlog, tc.PostCommand))
}

// GetStatus inserts new greeting
func (tc *TwinController) GetStatus(w http.ResponseWriter, r *http.Request) {
	sj, err := json.Marshal(tc.track)
	if err != nil {
		mlog.Println("ERROR: Error de-marshaling TheStatus")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(sj)
}

// PostCommand sends a command via Kafka to the controller
func (tc *TwinController) PostCommand(w http.ResponseWriter, r *http.Request) {
	// Read command from request
	cmd := anki.Command{}
	err := json.NewDecoder(r.Body).Decode(&cmd)
	if err != nil {
		mlog.Printf("ERROR: Error decoding request body: %s", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	mlog.Printf("INFO: Sending command to channel")
	cmd.CalculateLaneNo(tc.track[cmd.CarNo-1].LaneNo)
	tc.cmdCh <- cmd
	mlog.Printf("INFO: Command processed by channel")
	w.WriteHeader(http.StatusOK)
}
