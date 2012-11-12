#!/bin/bash

ulimit -n 10000

ab -n 1000 -c 10 -p ./requests/wsn_newInNotifyOutput.json -T "application/json" http://127.0.0.1:3000/api/v1/monitoring/wsn/