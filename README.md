# CKAN NG Montreal Theme
Public theme for Montreal open data portal built with CKAN Next Generation


## Heroku

Heroku uses the `npm start` command which calls `deploy.sh`
For details on deployment take a look at `deploy.sh` 
Some highlights:

* Clones frontend-v2 at master
* Copies .staging.env to frontend-v2/.env on heroku
