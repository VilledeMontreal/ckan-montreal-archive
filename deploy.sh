#!/bin/bash
echo "hElLo worLd"
git clone https://github.com/datopian/frontend-v2.git
cp -r . frontend-v2/themes/ckan_ng_montreal_theme
cp frontend-v2/themes/ckan_ng_montreal_theme/.staging.env .env
yarn start
