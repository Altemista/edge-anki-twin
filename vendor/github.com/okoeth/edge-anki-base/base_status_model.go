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

package anki

import "time"

type (
	// Status represents a status update message from the Anki Overdrive controller
	Status struct {
		MsgID           int         `json:"msgID"`
		MsgName         string      `json:"msgName"`
		MsgTimestamp    time.Time   `json:"msgTimestamp"`
		CarNo           int         `json:"carNo"`
		CarID           string      `json:"carID"`
		CarSpeed        int         `json:"carSpeed"`
		CarVersion      int         `json:"carVersion"`
		CarBatteryLevel int         `json:"carBatteryLevel"`
		LaneOffset      float32     `json:"laneOffset"`
		LaneNo          int         `json:"laneNo"`
		PosTileType     int         `json:"posTileType"`
		PosTileNo       int         `json:"posTileNo"`
		PosLocation     int         `json:"posLocation"`
		PosOptions      []PosOption `json:"posOptions"`
	}
	// PosOption lists an option for a position
	PosOption struct {
		OptTileNo      int `json:"optTileNo"`
		OptProbability int `json:"optProbability"`
	}
)

// MergeStatusUpdate updates fields as per message type
func (s *Status) MergeStatusUpdate(u Status) {
	if u.MsgID == 23 {
		// No update, just a ping
	} else if u.MsgID == 25 {
		// Version update
		s.CarVersion = u.CarVersion
	} else if u.MsgID == 27 {
		// Battery update
		s.CarBatteryLevel = u.CarBatteryLevel
	} else if u.MsgID == 39 {
		// Position update
		s.CarSpeed = u.CarSpeed
		s.LaneOffset = u.LaneOffset
		s.LaneNo = u.LaneNo
		s.PosTileType = u.PosTileType
		s.PosTileNo = u.PosTileNo
		s.PosLocation = u.PosLocation
		s.PosOptions = u.PosOptions
		s.MsgTimestamp = u.MsgTimestamp
	} else if u.MsgID == 41 {
		// Transition update
		s.LaneOffset = u.LaneOffset
	} else if u.MsgID == 43 {
		// Delocalisation, not sure what to do
	} else if u.MsgID == 45 {
		// Offset update
		s.LaneOffset = u.LaneOffset
	} else if u.MsgID == 65 {
		// Offset update (undocumented?)
		s.LaneOffset = u.LaneOffset
	}
}
