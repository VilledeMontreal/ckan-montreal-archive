#!/bin/bash
echo "hElLo worLd"
rm -rf frontend-v2
git clone https://github.com/datopian/frontend-v2.git --branch feature/data-explorer-iframe
cp -r . frontend-v2/themes/ckan_ng_montreal_theme
cp .staging.env frontend-v2/.env
cd frontend-v2
yarn && yarn start
