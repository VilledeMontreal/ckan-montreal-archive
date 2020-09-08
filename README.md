# CKAN NG Montreal Theme
Public theme for Montreal open data portal built with CKAN Next Generation

## Locals

`index.js` contains `locals` variables, available to theme templates:

`terretoires`: JSON key -> values of territory form vals (mostly three-leter) to
the human-readable

`explorerFormats`: an array of lowercase file formats. Resources
of these formats should render the data explorer.

### Staging

Address = `https://montreal-frontend-staging.ckan.io/`

INSTANCE_NAME = `montreal-frontend-staging`

REGISTRY_REPO = `datopian/cloud-images/cloud-montreal-staging-ng` 

### Production

Address = `https://donnees.montreal.ca/`

INSTANCE_NAME = `montreal-frontend`

REGISTRY_REPO = `datopian/cloud-images/cloud-montreal-ng`