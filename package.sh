#!/bin/sh

# chmod a+x release.sh

FILENAME='AliPrice'
# TODAY=$(date)

rm -v $FILENAME.zip
zip -r $FILENAME.zip \
                  _locales \
                  icons/16.png \
                  icons/48.png \
                  icons/128.png \
                  js/*.js \
                  js/*/*.js \
                  manifest.json \
 --exclude="*/-*.*"
#  -x \*.DS_Store
# -z $TODAY
