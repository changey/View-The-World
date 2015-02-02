#!/bin/bash

startup(){
    # we gitignore this, make it...
    if [ ! -d ./target/working ]; then
        mkdir -p ./target/working
    fi
    if [ ! $(which aws) ]; then
        echo "AWS CLI tools are required, you may:\nbrew install awscli\napt-get install awscli"
    fi
}

startup

usage()
{
  cat <<EOF
usage: $0 options
This script will fetch an artifact from a Nexus server using the Nexus REST redirect service.
 
OPTIONS:
-p aws profile
-e environment (majdev, majqa, majstg, prd)
-v view the world app version
EOF
}

# Read in Complete Set of Coordinates from the Command Line
PROFILE=
BUCKET=
VERSION=

while getopts "hp:e:v:" OPTION
do
case $OPTION in
         h)
             usage
             exit 1
             ;;
         p)
            PROFILE=$OPTARG
             ;;
         e)
            if [ "$OPTARG" = "majdev" ]
            then
              BUCKET=r20.sunrundev.com
              REGION=us-west-1
              PROPERTIES='./target/working/development.json'
            fi
            if [ "$OPTARG" = "majqa" ]
            then
              BUCKET=majqa-r20.sunrundev.com
              REGION=us-west-2
              PROPERTIES='./target/working/development.json'
            fi
            if [ "$OPTARG" = "majstg" ]
            then
              BUCKET=majstg-r20.sunrun.com
              REGION=us-west-2
              PROPERTIES='./target/working/staging.json'
            fi
            if [ "$OPTARG" = "prd" ]
            then
              BUCKET=r21.sunrun.com
              REGION=us-west-1
              PROPERTIES='./target/working/production.json'
            fi
            
             ;;
         v)
            VERSION=$OPTARG
             ;;
         ?)
             echo "Illegal argument $OPTION=$OPTARG" >&2
             usage
             exit
             ;;
     esac
done

rm -rf vtw.zip

./downloadArtifact.sh -a com.sunrun:view-the-world:$VERSION -e jar -o ./vtw.zip -r public -n https://ci-nexus.sunrunhome.com -u readonly -p coRn8Ann0iS2is

rm -rf ./target/working/
unzip vtw.zip -d ./target/working/ 

cp -f $PROPERTIES './target/working/properties.json'

aws s3 sync ./target/working/ s3://$BUCKET \
  --exclude '*' \
  --include '*.js' --include '*.html' --include '*.tmpl' --include '*.css' --include '*.ttf' \
  --include 'tourLocationSets.json' \
  --include 'faqcards.json' \
  --include 'properties.json' \
  --include 'branches.json' \
  --include 'leadOrganizations.json' \
  --include 'vendor/**/*' \
  --include '*.jpg' --include '*.png' \
  --region $REGION \
  --acl public-read \
  --profile ${PROFILE} \
  --delete
