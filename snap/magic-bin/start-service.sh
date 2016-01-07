#!/bin/sh

set -e
set -x

mkdir -p $SNAP_APP_DATA_PATH/etc/grafana/
mkdir -p $SNAP_APP_DATA_PATH/var/log/grafana/
mkdir -p $SNAP_APP_DATA_PATH/var/lib/grafana/
mkdir -p $SNAP_APP_DATA_PATH/usr/share/grafana/
cp -n $SNAP_APP_PATH/conf/defaults.ini $SNAP_APP_DATA_PATH/etc/grafana/grafana.ini

# WORKING_DIR would be $SNAP_APP_DATA_PATH
# copy front end files into SNAP_APP_DATA_PATH so that static_root_path variable in grafana.ini could use relative path
rm -rf $SNAP_APP_DATA_PATH/usr/share/grafana/public
cp -r --preserve=mode $SNAP_APP_PATH/usr/share/grafana/public $SNAP_APP_DATA_PATH/usr/share/grafana/public
# copy conf/ into WORKING_DIR so that grafana could find default configuration in $WORKING_DIR/conf/defaults.ini
rm -rf $SNAP_APP_DATA_PATH/conf
cp -r --preserve=mode $SNAP_APP_PATH/conf $SNAP_APP_DATA_PATH/conf
# copy var/ into WORKING_DIR
cp -r --preserve=mode $SNAP_APP_PATH/var/* $SNAP_APP_DATA_PATH/var/

$SNAP_APP_PATH/magic-bin/grafana \
  -config=$SNAP_APP_DATA_PATH/etc/grafana/grafana.ini \
  -homepath=$SNAP_APP_DATA_PATH \
  -pidfile=$SNAP_APP_DATA_PATH/var/run/grafana.pid

