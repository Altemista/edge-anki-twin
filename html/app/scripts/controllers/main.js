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

'use strict';

var timer;

function refreshLoop($scope, $timeout, MainFactory) {
	timer = $timeout(function () {
		//console.log('INFO: Timer set');
	}, 200);
	timer.then(function () {
		console.log('INFO: Timer triggered');
		MainFactory.getStatus()
			.then(
			function (response) { // ok
				$scope.status = response.data;

				//Bind selected car model
				if(!$scope.car0BtId) {
          $scope.car0BtId = $scope.status[0].carID;
        }
        if(!$scope.car1BtId) {
          $scope.car1BtId = $scope.status[1].carID;
        }
        if(!$scope.car2BtId) {
          $scope.car2BtId = $scope.status[2].carID;
        }
        if(!$scope.car3BtId) {
          $scope.car3BtId = $scope.status[3].carID;
        }

        //Translate car offset to laneNo
        $scope.status[0].laneOffset = MainFactory.translateCarOffsetToLane($scope.status[0].laneOffset);
        $scope.status[1].laneOffset = MainFactory.translateCarOffsetToLane($scope.status[1].laneOffset);
        $scope.status[2].laneOffset = MainFactory.translateCarOffsetToLane($scope.status[2].laneOffset);
        $scope.status[3].laneOffset = MainFactory.translateCarOffsetToLane($scope.status[3].laneOffset);

        if ($scope.showCollisionImg) {
          console.log('INFO: Timer for image reload triggered');
          $scope.imageUrl = MainFactory.getCollisionImageURL();
        }

        // update the car-specific images
        $scope.car1img = $scope.findImgFileForId($scope.car1BtId);
        $scope.car2img = $scope.findImgFileForId($scope.car2BtId);
        $scope.car1tileimg = $scope.findImgFileForTileType($scope.status[1].posTileType);
        $scope.car2tileimg = $scope.findImgFileForTileType($scope.status[2].posTileType);

        if (!$scope.car1BtId) {
          $scope.status[1].carBatteryLevel = -1;
        }
        if (!$scope.car2BtId) {
          $scope.status[2].carBatteryLevel = -1;
        }
        $scope.car1batteryimg = $scope.findImgFileForBatteryLevel($scope.status[1].carBatteryLevel);
        $scope.car2batteryimg = $scope.findImgFileForBatteryLevel($scope.status[2].carBatteryLevel);
			},
			function (response) { // nok
				console.error('ERROR: getStatus request failed: ' + response.statusText);

				// DEBUG: use some mock data if the back-end is missing
        $scope.status[1].carID = 'fb8f2bab1e4b';
        $scope.status[2].carID = '';
        $scope.car1BtId = $scope.status[1].carID;
        $scope.car2BtId = $scope.status[2].carID;
        $scope.status[1].laneOffset = '1';
        $scope.status[2].laneOffset = '2';
        $scope.status[1].carSpeed = '450';
        $scope.status[2].carSpeed = '460';
        $scope.status[1].laneNo = '1';
        $scope.status[2].laneNo = '2';
        $scope.status[1].carBatteryLevel = '3540';
        $scope.status[2].carBatteryLevel = '3890';
        $scope.status[1].posTileNo = '1';
        $scope.status[2].posTileNo = '2';
        $scope.status[1].posTileType = 'STRAIGHT';
        $scope.status[2].posTileType = 'CURVE';
        $scope.car1img = $scope.findImgFileForId($scope.status[1].carID);
        $scope.car2img = $scope.findImgFileForId($scope.status[2].carID);
        $scope.car1tileimg = $scope.findImgFileForTileType($scope.status[1].posTileType);
        $scope.car2tileimg = $scope.findImgFileForTileType($scope.status[2].posTileType);

        if (!$scope.car1BtId) {
          $scope.status[1].carBatteryLevel = -1;
        }
        if (!$scope.car2BtId) {
          $scope.status[2].carBatteryLevel = -1;
        }
        $scope.car1batteryimg = $scope.findImgFileForBatteryLevel($scope.status[1].carBatteryLevel);
        $scope.car2batteryimg = $scope.findImgFileForBatteryLevel($scope.status[2].carBatteryLevel);
        $scope.imageUrl = '/images/capture.jpg';
			}
			);
		if ($scope.poll) {
			refreshLoop($scope, $timeout, MainFactory);
		}
	}, function () {
		console.error('ERROR: Timer rejected!');
	});
}


/**
 * @ngdoc function
 * @name htmlApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the htmlApp
 */
angular.module('htmlApp')
	.controller('MainCtrl', ['$scope', '$timeout', 'MainFactory', 'MainConfig',
		function ($scope, $timeout, MainFactory, MainConfig) {
    // required by the test framework, if you remove this you must also remove the test controller for main.js
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

		// Handler function for togging of status polling
		$scope.togglePoll = function () {
			console.log('INFO: Handling togglePoll');
			if ($scope.poll) {
				$scope.text = 'Start polling';
				$scope.poll = false;
			} else {
				$scope.text = 'Stop polling';
				$scope.poll = true;
				refreshLoop($scope, $timeout, MainFactory);
			}
		};

		// Handler function for pinging the car
		$scope.requestPing = function (carNo) {
			console.log('INFO: Handling requestPing for carno '+carNo);
			var command = {
				command: 'ping',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: Ping command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for version of the car
		$scope.requestVersion = function (carNo) {
			console.log('INFO: Handling requestVersion for carno '+carNo);
			var command = {
				command: 'ver',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: Version command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

    // Handler function for changeSpeedUp of the car (250-1000)
    $scope.swapCar = function (carNo) {
      console.log('INFO: Handling swap bluetooth id for carno '+carNo);
      var command = {
        command: 'swap',
        param1: ''+$scope['car' + carNo + 'BtId'],
        carNo: carNo,
        source: 'ui'
      };
      MainFactory.postCommand(command)
        .then(
          function (response) { // ok
            console.log('INFO: Swap command submitted to server: '+response.statusText);
          },
          function (response) { // nok
            console.error('ERROR: Request failed: ' + response.statusText);
          }
        );
    };

		// Handler function for changeSpeedUp of the car (250-1000)
		$scope.changeSpeedUp = function (carNo) {
			console.log('INFO: Handling changeSpeedUp for carno '+carNo);
			var command = {
				command: 's',
				param1: ''+MainConfig.highSpeed,
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: SpeedUp command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeSpeedDown of the car (250-1000)
		$scope.changeSpeedDown = function (carNo) {
			console.log('INFO: Handling changeSpeedDown for carno '+carNo);
			var command = {
				command: 's',
				param1: ''+MainConfig.slowSpeed,
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: SpeedDown command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeSpeedStop of the car (250-1000)
		$scope.changeSpeedStop = function (carNo) {
			console.log('INFO: Handling changeSpeedStop for carno '+carNo);
			var command = {
				command: 's',
        param1: '0',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: SpeedStop command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeLaneLeft with the car (-68-+68)
		$scope.changeLaneLeft = function (carNo) {
			console.log('INFO: Handling changeLaneLeft for carno '+carNo);
			var command = {
				command: 'c',
				param1: '', // Will be evaluated by server
				param2: 'left',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: changeLaneLeft command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeLaneRight with the car (-68-+68)
		$scope.changeLaneRight = function (carNo) {
			console.log('INFO: Handling changeLaneRight for carno '+carNo);
			var command = {
				command: 'c',
				param1: '', // Will be evaluated by server
				param2: 'right',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: changeLaneRight command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for showInitialise
		$scope.showInitialise = function (carNo) {
			console.log('INFO: Handling showInitialise for carno '+carNo);
		};

		// Handler function for changeLight
		$scope.changeLight = function (carNo) {
			console.log('INFO: Handling changeLight for carno '+carNo);
			var command = {
				command: 'l',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: changeLight command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeLightPattern
		$scope.changeLightPattern = function (carNo) {
			console.log('INFO: Handling changeLightPattern for carno '+carNo);
			var command = {
				command: 'lp',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: changeLightPattern command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for requestLevel
		$scope.requestLevel = function (carNo) {
			console.log('INFO: Handling requestLevel for carno '+carNo);
			var command = {
				command: 'bat',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: requestLevel command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for toggling the collision tile image
    $scope.toggleCollisionImage = function () {
      console.log('INFO: Handling toggle collision image');
      this.showCollisionImg = !this.showCollisionImg;
    };

		$scope.imgFilePrefix = 'images/';

		$scope.imgFileForId = [
      {'model': 'Choose a Car', 'btid': '', 'img': 'placeholder.jpg'},
      {'model': '0 GROUNDSHOCK (BLUE)', 'btid': 'edef582991e2', 'img': 'groundshock.jpg'},
      {'model': '1 SKULL (BLACK)', 'btid': 'fb8f2bab1e4b', 'img': 'skull.jpg'},
      {'model': '2 NUKE (GREEN/BLACK)', 'btid': 'fb2c43ca4073', 'img': 'nuke.jpg'},
      {'model': '3 NUKE (GREEN/BLACK)', 'btid': 'f458e8027a27', 'img': 'nuke.jpg'},
      {'model': '4 BIGBANG (GREEN)', 'btid': 'c3f8b8e6ba79', 'img': 'bigbang.jpg'},
      {'model': '5 BIGBANG (GREEN)', 'btid': 'd1ffcbf22347', 'img': 'bigbang.jpg'},
      {'model': '6 THERMO (RED)', 'btid': 'e07c5f42d543', 'img': 'thermo.jpg'},
      {'model': '7 THERMO (RED)', 'btid': 'e67a69585ca4', 'img': 'thermo.jpg'},
      {'model': '8 GUARDIAN (BLUE/SILVER)', 'btid': 'd4435b819516', 'img': 'guardian.jpg'},
      {'model': '9 GUARDIAN (BLUE/SILVER)', 'btid': 'e58aa933a106', 'img': 'guardian.jpg'},
      {'model': '10 GROUNDSHOCK (BLUE)', 'btid': 'f4f96680d1f2', 'img': 'groundshock.jpg'},
      {'model': '11 SKULL (BLACK)', 'btid': 'ec7d32207f95', 'img': 'skull.jpg'},
      {'model': '12 NUKE (GREEN/BLACK)', 'btid': 'f094f611c8e5', 'img': 'nuke.jpg'},
      {'model': '13 NUKE (GREEN/BLACK)', 'btid': 'd72c9a461b87', 'img': 'nuke.jpg'},
      {'model': '14 BIGBANG (GREEN)', 'btid': 'ea90f84f2804', 'img': 'bigbang.jpg'},
      {'model': '15 BIGBANG (GREEN)', 'btid': 'f30da22227b1', 'img': 'bigbang.jpg'},
      {'model': '16 THERMO (RED)', 'btid': 'd00a4e9b93d3', 'img': 'thermo.jpg'},
      {'model': '17 THERMO (RED)', 'btid': 'f65332e1688c', 'img': 'thermo.jpg'},
      {'model': '18 GUARDIAN (BLUE/SILVER)', 'btid': 'eee9ed31eac1', 'img': 'guardian.jpg'},
      {'model': '19 GUARDIAN (BLUE/SILVER)', 'btid': 'd3c74657a020', 'img': 'guardian.jpg'},
      {'model': '20 MUSCLE (GRAY)', 'btid': 'd4b42cc5cf27', 'img': 'muscle.jpg'},
      {'model': '21 PICKUPTRUCK (GRAY)', 'btid': 'd00a267f9e09', 'img': 'pickuptruck.jpg'},
      {'model': 'XX FREEWHEEL (GREEN/SILVER)', 'btid': 'df46034abd1b', 'img': 'freewheel.jpg'},
      {'model': '1 GROUNDSHOCK (BLUE)', 'btid': 'da817193ce9c', 'img': 'groundshock.jpg'},
      {'model': '2 SKULL (BLACK)', 'btid': 'e6d3ac9af37e', 'img': 'skull.jpg'}
    ];

    $scope.findImgFileForId = function(btid) {
      // try first to see if the image file is named in the cars json from the back-end
      for (var i1 = 0; i1 < $scope.cars.length; i1++) {
        if ($scope.cars[i1].btid === btid && $scope.cars[i1].img) {
          return $scope.imgFilePrefix + $scope.cars[i1].img;
        }
      }

      // fall back to the built-in list for an image file to use for a car, given the bluetooth id
      for (var i2 = 0; i2 < $scope.imgFileForId.length; i2++) {
        if ($scope.imgFileForId[i2].btid === btid) {
          return $scope.imgFilePrefix + $scope.imgFileForId[i2].img;
        }
      }

      // finally, use a default if there is no other choice
      return $scope.imgFilePrefix + $scope.imgFileForId[0].img;
    };

    $scope.imgFileForTileType = [
      {'type': '-', 'img': 'unknown-tile.jpg'},
      {'type': 'STRAIGHT', 'img': 'straight.jpg'},
      {'type': 'CURVE', 'img': 'curve.jpg'},
      {'type': 'CROSSING', 'img': 'crossing.jpg'}
    ];

    $scope.findImgFileForTileType = function(tileType) {
      for (var i3 = 0; i3 < $scope.imgFileForTileType.length; i3++) {
        if ($scope.imgFileForTileType[i3].type === tileType) {
          return $scope.imgFilePrefix + $scope.imgFileForTileType[i3].img;
        }
      }
      return $scope.imgFilePrefix + $scope.imgFileForTileType[0].img;
    };

    // battery levels need to be in order here, from fullest to emptiest
    $scope.imgFileForBatteryMin = [
      {'min': 3800, 'img': 'full-battery.png'},
      {'min': 3200, 'img': 'half-battery.png'},
      {'min': 0, 'img': 'empty-battery.png'}
    ];

    $scope.findImgFileForBatteryLevel = function(level) {
      // looks for the fullest battery icon that qualifies at the given level
      for (var i4 = 0; i4 < $scope.imgFileForBatteryMin.length; i4++) {
        if ($scope.imgFileForBatteryMin[i4].min <= level) {
          return $scope.imgFilePrefix + $scope.imgFileForBatteryMin[i4].img;
        }
      }
      return $scope.imgFilePrefix + 'battery-icon.png';
    };

		// Initialise
		$scope.lastUpdate = 'N/A';
		$scope.poll = false;
		$scope.text = 'Start polling';
		$scope.status = [{},{},{}];
    $scope.speedimg = $scope.imgFilePrefix + 'speedometer.png';
    $scope.laneimg = $scope.imgFilePrefix + 'lane.png';
    $scope.tilenumberimg = $scope.imgFilePrefix + 'tile-number.png';
    $scope.showCollisionImg = false;

		MainFactory.getCars()
      .then(
        function(response) {  // ok
          $scope.cars = response.data;
        },
        function (response) { // nok
          console.error('ERROR: getCars request failed: ' + response.statusText);

          // DEBUG: use mock data for cars if the back-end is missing
          $scope.cars = [
            {'model': 'Choose a Car', 'btid': '', 'img': 'placeholder.jpg'},
            {'model': '0 GROUNDSHOCK (BLUE)', 'btid': 'edef582991e2', 'img': 'groundshock.jpg'},
            {'model': '1 SKULL (BLACK)', 'btid': 'fb8f2bab1e4b', 'img': 'skull.jpg'},
            {'model': '2 NUKE (GREEN/BLACK)', 'btid': 'fb2c43ca4073', 'img': 'nuke.jpg'},
            {'model': '3 NUKE (GREEN/BLACK)', 'btid': 'f458e8027a27', 'img': 'nuke.jpg'},
            {'model': '4 BIGBANG (GREEN)', 'btid': 'c3f8b8e6ba79', 'img': 'bigbang.jpg'},
            {'model': '5 BIGBANG (GREEN)', 'btid': 'd1ffcbf22347', 'img': 'bigbang.jpg'},
            {'model': '6 THERMO (RED)', 'btid': 'e07c5f42d543', 'img': 'thermo.jpg'},
            {'model': '7 THERMO (RED)', 'btid': 'e67a69585ca4', 'img': 'thermo.jpg'},
            {'model': '8 GUARDIAN (BLUE/SILVER)', 'btid': 'd4435b819516', 'img': 'guardian.jpg'},
            {'model': '9 GUARDIAN (BLUE/SILVER)', 'btid': 'e58aa933a106', 'img': 'guardian.jpg'},
            {'model': '10 GROUNDSHOCK (BLUE)', 'btid': 'f4f96680d1f2', 'img': 'groundshock.jpg'},
            {'model': '11 SKULL (BLACK)', 'btid': 'ec7d32207f95', 'img': 'skull.jpg'},
            {'model': '12 NUKE (GREEN/BLACK)', 'btid': 'f094f611c8e5', 'img': 'nuke.jpg'},
            {'model': '13 NUKE (GREEN/BLACK)', 'btid': 'd72c9a461b87', 'img': 'nuke.jpg'},
            {'model': '14 BIGBANG (GREEN)', 'btid': 'ea90f84f2804', 'img': 'bigbang.jpg'},
            {'model': '15 BIGBANG (GREEN)', 'btid': 'f30da22227b1', 'img': 'bigbang.jpg'},
            {'model': '16 THERMO (RED)', 'btid': 'd00a4e9b93d3', 'img': 'thermo.jpg'},
            {'model': '17 THERMO (RED)', 'btid': 'f65332e1688c', 'img': 'thermo.jpg'},
            {'model': '18 GUARDIAN (BLUE/SILVER)', 'btid': 'eee9ed31eac1', 'img': 'guardian.jpg'},
            {'model': '19 GUARDIAN (BLUE/SILVER)', 'btid': 'd3c74657a020', 'img': 'guardian.jpg'},
            {'model': '20 MUSCLE (GRAY)', 'btid': 'd4b42cc5cf27', 'img': 'muscle.jpg'},
            {'model': '21 PICKUPTRUCK (GRAY)', 'btid': 'd00a267f9e09', 'img': 'pickuptruck.jpg'},
            {'model': 'XX FREEWHEEL (GREEN/SILVER)', 'btid': 'df46034abd1b', 'img': 'freewheel.jpg'}
          ];
        }
      );

    if(!$scope.poll) {
      $scope.togglePoll();
    }

}]);
