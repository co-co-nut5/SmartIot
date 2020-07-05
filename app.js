/**
 * Created by ryeubi on 2015-08-31.
 * Updated 2017.03.06
 * Made compatible with Thyme v1.7.2
 */

var net = require('net');
var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');
var exec = require("child_process").exec;

var wdt = require('./wdt');

var ROSLIB = require('roslib');



var useparentport = '';
var useparenthostname = '';

var upload_arr = [];
var download_arr = [];

var conf = {};

// This is an async file read
fs.readFile('conf.xml', 'utf-8', function (err, data) {
    if (err) {
        console.log("FATAL An error occurred trying to read in the file: " + err);
        console.log("error : set to default for configuration")
    }
    else {
        var parser = new xml2js.Parser({explicitArray: false});
        parser.parseString(data, function (err, result) {
            if (err) {
                console.log("Parsing An error occurred trying to read in the file: " + err);
                console.log("error : set to default for configuration")
            }
            else {
                var jsonString = JSON.stringify(result);
                conf = JSON.parse(jsonString)['m2m:conf'];

                useparenthostname = conf.tas.parenthostname;
                useparentport = conf.tas.parentport;

                if(conf.upload != null) {
                    if (conf.upload['ctname'] != null) {
                        upload_arr[0] = conf.upload;
                    }
                    else {
                        upload_arr = conf.upload;
                    }
                }

                if(conf.download != null) {
                    if (conf.download['ctname'] != null) {
                        download_arr[0] = conf.download;
                    }
                    else {
                        download_arr = conf.download;
                    }
                }
            }
        });
    }
});


var tas_state = 'init';

var upload_client = null;

var t_count = 0;

var tas_download_count = 0;

var prepose = '';

var ros = new ROSLIB.Ros({
    url : 'localhost' 
}); //your own IP

// If there is an error on the backend, an 'error' emit will be emitted.
ros.on('error', function(error) {
  console.log(error);
});

// Find out exactly when we made a connection.
ros.on('connection', function() {
  // console.log('Connection made!');
});

ros.on('close', function() {
  // console.log('Connection closed.');
});

// Create a connection to the rosbridge WebSocket server.
ros.connect('ws://localhost');  //your own IP

var talker = new ROSLIB.Topic({
  ros : ros,
  name : '/move_base_simple/goal',
  messageType : 'geometry_msgs/PoseStamped'
});

var listener = new ROSLIB.Topic({
  ros : ros,
  name : '/amcl_pose',
  messageType : 'geometry_msgs/PoseWithCovarianceStamped'
});

function on_receive(data) {
    if (tas_state == 'connect' || tas_state == 'reconnect' || tas_state == 'upload') {
        var data_arr = data.toString().split('<EOF>');
        if(data_arr.length >= 2) {
            for (var i = 0; i < data_arr.length - 1; i++) {
                var line = data_arr[i];
                var sink_str = util.format('%s', line.toString());
                var sink_obj = JSON.parse(sink_str);

                if (sink_obj.ctname == null || sink_obj.con == null) {
                   console.log('Received: data format mismatch');
                }
                else {
                    if (sink_obj.con == 'hello') {
                        if (++tas_download_count >= download_arr.length) {
                            tas_state = 'upload';
                        }
                    }
                    else {
                        for (var j = 0; j < upload_arr.length; j++) {
                            if (upload_arr[j].ctname == sink_obj.ctname) {
                                break;
                            }
                        }

                        for (j = 0; j < download_arr.length; j++) {
                            if (download_arr[j].ctname == sink_obj.ctname) {
                                g_down_buf = JSON.stringify({id: download_arr[i].id, con: sink_obj.con});
                                control_led(sink_obj.con);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}


function control_led(){
    // console.log("hello mobius")
}

var Serial = null;
var myPort = null;

var p1x = 6.2;
var p1y = 0.8;
var p2x = 3.7;
var p2y = 0.7;
var p3x = 1.3;
var p3y = 0.6;
var p4x = 2.0;
var p4y = -3.0;
var p5x = 6.3;
var p5y = -3.8;
var p6x = 2.0;
var p6y = 0.0;
var p7x = 2.0;
var p7y = 0.0;
var p8x = 2.0;
var p8y = 0.0;
var p9x = 2.0;
var p9y = 0.0;
var p10x = 2.0;
var p10y = 0.0;

var jObject1 = null;
var number=0;

function checkOfLocation(x,y) {
   if ((x >= (p1x-0.5) && x < (p1x + 0.5)) && (y >= (p1y-0.5) && y < (p1y + 0.5))){
     console.log("room1");
     if(prepose == 'room1') tas_state = 'scanf';
   }
   else if ((x >= (p2x-0.5) && x < (p2x + 0.5)) && (y >= (p2y-0.5) && y < (p2y + 0.5))){
     console.log("room2");
     if(prepose == 'room2') tas_state = 'scanf';
   }
   else if ((x >= (p3x-0.5) && x < (p3x + 0.5)) && (y >= (p3y-0.5) && y < (p3y + 0.5))){
     console.log("room3");
     if(prepose == 'room3') tas_state = 'scanf';
   }
   else if ((x >= (p4x-0.5) && x < (p4x + 0.5)) && (y >= (p4y-0.5) && y < (p4y + 0.5))){
     console.log("room4");
     if(prepose == 'room4') tas_state = 'scanf';
   }
   else if ((x >= (p5x-0.5) && x < (p5x + 0.5)) && (y >= (p5y-0.5) && y < (p5y + 0.5))){
     console.log("room5");
     if(prepose == 'room5') tas_state = 'scanf';
   }
   else if ((x >= (p6x-0.5) && x < (p6x + 0.5)) && (y >= (p6y-0.5) && y < (p6y + 0.5))){
     console.log("location1");
     if(prepose == 'location1') tas_state = 'scanf';
   }
   else if ((x >= (p7x-0.5) && x < (p7x + 0.5)) && (y >= (p7y-0.5) && y < (p7y + 0.5))){
     console.log("location2");
     if(prepose == 'location2') tas_state = 'scanf';
   }
   else if ((x >= (p8x-0.5) && x < (p8x + 0.5)) && (y >= (p8y-0.5) && y < (p8y + 0.5))){
     console.log("location3");
     if(prepose == 'location3') tas_state = 'scanf';
   }
   else if ((x >= (p9x-0.5) && x < (p9x + 0.5)) && (y >= (p9y-0.5) && y < (p9y + 0.5))){
     console.log("location4");
     if(prepose == 'location4') tas_state = 'scanf';
   }
   else if ((x >= (p10x-0.5) && x < (p10x + 0.5)) && (y >= (p10y-0.5) && y < (p10y + 0.5))){
     console.log("location5");
     if(prepose == 'location5') tas_state = 'scanf';
   }
   else console.log("moving");
}

function tas_watchdog() {


       var pose1 = new ROSLIB.Message({
        header : {
          seq : 0,
          stamp : 0,
          frame_id : 'map'
        },
        pose : {
          position : {
            x : p1x,
            y : p1y,
            z : 0.0
          },
          //do not change
           orientation: {
            x : 0.0,
            y : 0.0,
            z : 0.0,
            w : 1.0
          }
        }

        });

       var pose2 = new ROSLIB.Message({
        header : {
          seq : 0,
          stamp : 0,
          frame_id : 'map'
        },
        pose : {
          position : {
            x : p2x,
            y : p2y,
            z : 0.0
          },
          //do not change
           orientation: {
            x : 0.0,
            y : 0.0,
            z : 0.0,
            w : 1.0
          }
        }

        });

       var pose3 = new ROSLIB.Message({
        header : {
          seq : 0,
          stamp : 0,
          frame_id : 'map'
        },
        pose : {
          position : {
            x : p3x,
            y : p3y,
            z : 0.0
          },
          //do not change
           orientation: {
            x : 0.0,
            y : 0.0,
            z : 0.0,
            w : 1.0
          }
        }

        });

       var pose4 = new ROSLIB.Message({
        header : {
          seq : 0,
          stamp : 0,
          frame_id : 'map'
        },
        pose : {
          position : {
            x : p4x,
            y : p4y,
            z : 0.0
          },
          //do not change
           orientation: {
            x : 0.0,
            y : 0.0,
            z : 0.0,
            w : 1.0
          }
        }

        });

        var pose5 = new ROSLIB.Message({
         header : {
           seq : 0,
           stamp : 0,
           frame_id : 'map'
         },
         pose : {
           position : {
             x : p5x,
             y : p5y,
             z : 0.0
           },
           //do not change
            orientation: {
             x : 0.0,
             y : 0.0,
             z : 0.0,
             w : 1.0
           }
         }

         });

         var pose6 = new ROSLIB.Message({
          header : {
            seq : 0,
            stamp : 0,
            frame_id : 'map'
          },
          pose : {
            position : {
              x : p6x,
              y : p6y,
              z : 0.0
            },
            //do not change
             orientation: {
              x : 0.0,
              y : 0.0,
              z : 0.0,
              w : 1.0
            }
          }

          });

          var pose7 = new ROSLIB.Message({
           header : {
             seq : 0,
             stamp : 0,
             frame_id : 'map'
           },
           pose : {
             position : {
               x : p7x,
               y : p7y,
               z : 0.0
             },
             //do not change
              orientation: {
               x : 0.0,
               y : 0.0,
               z : 0.0,
               w : 1.0
             }
           }

           });

           var pose8 = new ROSLIB.Message({
            header : {
              seq : 0,
              stamp : 0,
              frame_id : 'map'
            },
            pose : {
              position : {
                x : p8x,
                y : p8y,
                z : 0.0
              },
              //do not change
               orientation: {
                x : 0.0,
                y : 0.0,
                z : 0.0,
                w : 1.0
              }
            }

            });

            var pose9 = new ROSLIB.Message({
             header : {
               seq : 0,
               stamp : 0,
               frame_id : 'map'
             },
             pose : {
               position : {
                 x : p9x,
                 y : p9y,
                 z : 0.0
               },
               //do not change
                orientation: {
                 x : 0.0,
                 y : 0.0,
                 z : 0.0,
                 w : 1.0
               }
             }

             });

             var pose10 = new ROSLIB.Message({
              header : {
                seq : 0,
                stamp : 0,
                frame_id : 'map'
              },
              pose : {
                position : {
                  x : p10x,
                  y : p10y,
                  z : 0.0
                },
                //do not change
                 orientation: {
                  x : 0.0,
                  y : 0.0,
                  z : 0.0,
                  w : 1.0
                }
              }

              });


    if(tas_state == 'init') {
        upload_client = new net.Socket();

        upload_client.on('data', on_receive);

        upload_client.on('error', function(err) {
            console.log(err);
            tas_state = 'reconnect';
        });

        upload_client.on('close', function() {
            // console.log('Connection closed');
            upload_client.destroy();
            tas_state = 'reconnect';
        });
        tas_state = 'scanf';
    }
    else if(tas_state == 'scanf'){
      var scanf = require('scanf');

      console.log('move or modify or exit?');
      var mr = scanf('%s');
      if(mr == 'move'){
        console.log('please input pose (room1~5,location1~5)');
        var pose = scanf('%s');

        if(pose == prepose){
          console.log('You have already arrived.');
        }
        prepose = pose;
        // And finally, publish.
        if (pose == "room1"){
          talker.publish(pose1);
        }
        else if (pose == "room2"){
          talker.publish(pose2);
        }
        else if (pose == "room3"){
          talker.publish(pose3);
        }
        else if (pose == "room4"){
          talker.publish(pose4);
        }
        else if (pose == "room5"){
          talker.publish(pose5);
        }
        else if (pose == "location1"){
          talker.publish(pose6);
        }
        else if (pose == "location2"){
          talker.publish(pose7);
        }
        else if (pose == "location3"){
          talker.publish(pose8);
        }
        else if (pose == "location4"){
          talker.publish(pose9);
        }
        else if (pose == "location5"){
          talker.publish(pose10);
        }
        if(upload_client) {
            // console.log('tas init ok');
            tas_state = 'init_thing';
        }
      }
      else if(mr == 'modify'){
        console.log('move destination and select location1~5 ex) 1');
        var number = scanf('%s');
        listener.subscribe(function(message) {
            var objectValuse = message.json;
            for (var key in objectValuse){
                // console.log("attr: " + key + ", value: " + objectValues[key]);
            }

            var topic_string = JSON.stringify(message);
            jObject1 = JSON.parse(topic_string);

            if(number =='1'){
              p6x = jObject1.pose.pose.position.x;
              p6y = jObject1.pose.pose.position.y;
              console.log('save locaton1');
              prepose = 'location1';
              number = 0;
              tas_state = 'scanf';
            }
            else if(number =='2'){
              p7x = jObject1.pose.pose.position.x;
              p7y = jObject1.pose.pose.position.y;
              console.log('save locaton2');
              prepose = 'location2';
              number = 0;
              tas_state = 'scanf';
            }
            else if(number =='3'){
              p8x = jObject1.pose.pose.position.x;
              p8y = jObject1.pose.pose.position.y;
              console.log('save locaton3');
              prepose = 'location3';
              number = 0;
              tas_state = 'scanf';
            }
            else if(number =='4'){
              p9x = jObject1.pose.pose.position.x;
              p9y = jObject1.pose.pose.position.y;
              console.log('save locaton4');
              prepose = 'location4';
              number = 0;
              tas_state = 'scanf';
            }
            else if(number =='5'){
              p10x = jObject1.pose.pose.position.x;
              p10y = jObject1.pose.pose.position.y;
              console.log('save locaton5');
              prepose = 'location5';
              number = 0;
              tas_state = 'scanf';
            }

            // console.log('Received message on ' + listener.name + topic_string);
            // If desired, we can unsubscribe from the topic as well.
            listener.unsubscribe();
        });

    }
    else if(mr == 'exit'){
      process.exit(1);
    }
      else{
        console.log('wrong input.');
        tas_state = 'scanf';
      }
    }
    else if(tas_state == 'init_thing') {
        control_led();

        tas_state = 'connect';
    }
    else if(tas_state == 'connect' || tas_state == 'reconnect') {
        // console.log('Connect try');
        upload_client.connect(useparentport, useparenthostname, function() {
            // console.log('upload Connected');
            tas_download_count = 0;

            for (var i = 0; i < download_arr.length; i++) {
                // console.log('download Connected - ' + download_arr[i].ctname + ' hello');
                var cin = {ctname: download_arr[i].ctname, con: 'hello'};
                upload_client.write(JSON.stringify(cin) + '<EOF>');
            }

            if (tas_download_count >= download_arr.length) {
                tas_state = 'upload';
                // console.log('[tas_state : '+ tas_state + ']');
            }
        });
    }
    else if (tas_state == 'upload'){
        listener.subscribe(function(message) {
            var objectValuse = message.json;
            for (var key in objectValuse){
                // console.log("attr: " + key + ", value: " + objectValues[key]);
            }

            var topic_string = JSON.stringify(message);
            jObject1 = JSON.parse(topic_string);
            console.log(jObject1.pose.pose.position.y);
            console.log(jObject1.pose.pose.position.x);

            checkOfLocation(jObject1.pose.pose.position.x,jObject1.pose.pose.position.y);


            // console.log('Received message on ' + listener.name + topic_string);
            // If desired, we can unsubscribe from the topic as well.
            listener.unsubscribe();
        });
    }
}


function sleep (delay) {
   var start = new Date().getTime();
   while (new Date().getTime() < start + delay);
}


wdt.set_wdt(require('shortid').generate(), 3, tas_watchdog);



var cur_c = '';
var pre_c = '';
var g_sink_buf = '';
var g_sink_ready = [];
var g_sink_buf_start = 0;
var g_sink_buf_index = 0;
var g_down_buf = '';
