module.exports = function (app) {
  const appHome = process.cwd();
  const dms = require(`${appHome}/lib/dms`);
  const config = require(`${appHome}/config`);
  const utils = require(`${appHome}/utils`);
  const Model = new dms.DmsModel(config);
  const fs = require("fs");
  const path = require("path");
  const fetch = require("node-fetch");
  const moment = require("moment");
  const cmsPosts = require("./cms-posts");
  const ActivityFeed = require("./activity-api");
  const proxy = require("express-http-proxy");

  const configApiUrl = config.get("API_URL");
  const configCkanUrl = config.get("CKAN_URL");
  const configProxyUrl = config.get("PROXY_URL");

  // set a cookie defaultLocale value for Moment
  app.use(function (req, res, next) {
    if (req.cookies.defaultLocale !== undefined) {
      let locale = req.cookies.defaultLocale || "fr";
      res.cookie("defaultLocale", locale, { path: "/" });
      moment.locale(locale);
    }
    next();
  });

  app.use((req, res, next) => {
    let configApiUrl = config.get("API_URL");

    res.locals.territoires = {
      "AHU": "Ahuntsic-Cartierville",
      "agglomeration": "Agglomération",
      "ANJ": "Anjou",
      "CDN": "Côte-des-Neiges-Notre-Dame-de-Grâce",
      "LAC": "Lachine",
      "LAS": "LaSalle",
      "PLA": "Le Plateau-Mont-Royal",
      "LSO": "Le Sud-Ouest",
      "IBI": "L'Île-Bizard-Sainte-Geneviève",
      "MHM": "Mercier-Hochelaga-Maisonneuve",
      "montreal": "Montréal",
      "MTN": "Montréal-Nord",
      "OUT": "Outremont",
      "PRF": "Pierrefonds-Roxboro",
      "RDP": "Rivière-des-Prairies-Pointe-aux-Trembles",
      "RPP": "Rosemont-La Petite-Patrie",
      "VSL": "Saint-Laurent",
      "STL": "Saint-Léonard",
      "VER": "Verdun",
      "VIM": "Ville-Marie",
      "VSE": "Villeray-Saint-Michel-Parc-Extension"
    };

    res.locals.explorerFormats = [
      "geojson",
      "csv",
      "tsv",
      "xls",
      "xlsx",
      "pdf"];

    res.locals.urls = {
      apiUrl: configApiUrl,
      ckanUrl: configCkanUrl,
      proxyUrl: configProxyUrl,
    };

    next();
  });

  // Proxy requests getting at the endpoint to https://montreal.l3.ckan.io
  app.use(
    /(.*)\/(.*)\.rdf/,
    proxy(config.get("API_URL"), {
      filter: (req, res) => {
        return req.method === "GET";
      },
      proxyReqPathResolver: (req, res, next) => {
        const requestUrl = req.url;
        const datasetId = req.params[1];

        if (datasetId) {
          // added /dataset because the proxy library expects only host name and truncates the remaining part.
          return `/dataset/${datasetId}.rdf`;
        }

        next();
      },
    })
  );

  app.get("/robots.txt", async (req, res) => {
    robotsPath = path.join(__dirname, "/public/robots.txt");
    if (fs.existsSync(robotsPath)) {
      res.sendFile(robotsPath);
    } else {
      res.type("text/plain");
      res.send("User-agent: *\nAllow: /");
    }
  });

  // Status check route connected to Google Cloud Uptime check
  app.get("/status", async (_req, res, _next) => {
    // Uptime
    const uptime = moment.duration(process.uptime(), "seconds");
    let y = "Y:" + uptime.years();
    let m = "M:" + uptime.months();
    let d = "D:" + uptime.days();
    let time =
      uptime.hours() + "h:" + uptime.minutes() + "m:" + uptime.seconds() + "s";
    let upTime = y + " " + m + " " + d + " " + time;

    // Status message
    let message = "Status: 200 OK";

    // Memory usage
    let memory_usage =
      "Memory usage (MB): " + Math.round(process.memoryUsage().rss / 1048576);

    // Backend connection
    const backendStatusUrl = configApiUrl + "status_show";
    let backendResponse = await fetch(backendStatusUrl);
    let backStatus = backendResponse.status;
    let backStatusText = backendResponse.statusText;
    let backendStatusMessage =
      "Backend status: " + backStatus + " " + backStatusText;

    const statusCheck = { upTime, message, memory_usage, backendStatusMessage };
    const statusLog =
      "[" +
      upTime +
      "]" +
      "[" +
      message +
      "]" +
      "[" +
      memory_usage +
      "]" +
      "[" +
      backendStatusMessage +
      "]";
    try {
      res.send(statusCheck);
      console.warn(statusLog);
    } catch (e) {
      healthcheck.message = e;
      res.status(503).send();
    }
  });

  app.get("/search", async (req, res, next) => {
    try {
      let facetNameToShowAll
      for (let [key, value] of Object.entries(req.query)) {
        if (key.includes('facet.limit.')) {
          facetNameToShowAll = key.split('.')[2]
          req.query['facet.limit'] = value
        }
      }
      const result = await Model.search(req.query)
      if (facetNameToShowAll) {
        for (let [key, value] of Object.entries(result.search_facets)) {
          // Sort facets by count
          result.search_facets[key].items = result.search_facets[key].items
            .sort((a, b) => b.count - a.count)
          if (key !== facetNameToShowAll) {
            result.search_facets[key].items = result.search_facets[key].items
              .slice(0, 5)
          }
        }
      }
    // Pagination
    const from = req.query.from || 0;
    const size = req.query.size || 10;
    const total = result.count;
    const totalPages = Math.ceil(total / size);
    const currentPage = parseInt(from, 10) / size + 1;
    const pages = utils.pagination(currentPage, totalPages);

    const query = req.query;

    // This is needed to be set if there is no query
    if (req.query.q === undefined) {
      query.q = "";
    }

    // This section is to truncate the description field from the search results to ~200 characters
    // and to enable proper processing of markdown
    for (var item in result.results) {
      if (!result.results[item].description){
        continue
      }
      let emTagNum =
        result.results[item].description.substring(0, 200).split("_").length -
        1;
      let strongTagNum =
        result.results[item].description.substring(0, 200).split("__").length -
        1;
      let hyperlinkTagEnd = result.results[item].description.indexOf(")", 200);
      let hyperlinkTagOpen = result.results[item].description.lastIndexOf(
        "[",
        200
      );
      let hyperlinkLinkStart = result.results[item].description.lastIndexOf(
        "(",
        hyperlinkTagEnd
      );
      let isHyperlynk =
        result.results[item].description.substring(
          hyperlinkLinkStart - 1,
          hyperlinkLinkStart
        ) == "]";

      if (
        hyperlinkTagEnd > 200 &&
        hyperlinkTagOpen < 200 &&
        hyperlinkTagOpen != -1 &&
        isHyperlynk
      ) {
        result.results[item].description =
          result.results[item].description.substring(0, hyperlinkTagEnd) +
          ") ...";
      } else {
        if (emTagNum % 2 != 0) {
          result.results[item].description =
            result.results[item].description.substring(0, 200) + "_ ...";
        } else {
          if (strongTagNum % 2 != 0) {
            result.results[item].description =
              result.results[item].description.substring(0, 200) + "__ ...";
          } else {
            if (result.results[item].description.length > 200) {
              result.results[item].description =
                result.results[item].description.substring(0, 200) + " ...";
            }
          }
        }
      }
    }

      res.render('search.html', {
        title: 'Search',
        result,
        query,
        totalPages,
        pages,
        currentPage
      })
    } catch (e) {
      next(e)
    };
  });

  app.get("/basic-auth/:user/:passwd", async (req, res, next) => {
    // Authenticate against CKAN backend. Note, we're using `ckanext-auth`
    // extension to expose login API.
    const loginAPI =
      config.get("CKAN_INTERNAL_URL") + "/api/3/action/user_login";

    let id, password;

    // Note that credentials in 'authorization' header is used over credentials
    // from params. Credentials in 'authorization' header is passed from
    // browser's built-in form and base64 encoded.
    if (req.get("authorization")) {
      const encodedCredentials = req.get("authorization").replace("Basic ", "");
      const buff = new Buffer(encodedCredentials, "base64");
      const decodedCredentials = buff.toString("ascii");
      // Decoded credentials are provided in form of "username:password"
      id = decodedCredentials.split(":")[0];
      password = decodedCredentials.split(":")[1];
    } else {
      id = req.params.user;
      password = req.params.passwd;
    }

    const response = await fetch(loginAPI, {
      method: "post",
      body: JSON.stringify({
        id,
        password,
      }),
    });

    const responseBody = await response.json();

    if (responseBody.result.error_summary) {
      res
        .set("WWW-Authenticate", 'Basic realm="Fake Realm"')
        .sendStatus(401)
        .end();
    } else {
      res.sendStatus(200).end();
    }
  });

  app.get("/dash", (req, res) => {
    const dashPage = fs.readFileSync(
      path.resolve(__dirname, "./public/dash/index.html")
    );
    res.render("dash.html", {
      title: "Dashboard",
      content: { dash: dashPage },
    });
  });

  // renders bare for iframe -- no header, footer, etc
  app.get("/data-explorer", (req, res) => {
    let explorer = {};

    try {
      explorer = JSON.parse(req.query.explorer);
      explorer.datapackage = JSON.stringify(explorer.datapackage);
      explorer = JSON.stringify(explorer).replace(/'/g, "&#x27;");
    } catch (e) {
      console.warn(e);
    }

    res.render("data-explorer.html", {
      explorer,
    });
  });

  // renders in-page for share link (header, footer, etc, are present)
  app.get("/explorer", (req, res) => {
    let explorer = {};
    try {
      explorer = JSON.parse(req.query.explorer);
      explorer.datapackage = JSON.stringify(explorer.datapackage);
      explorer = JSON.stringify(explorer).replace(/'/g, "&#x27;");
    } catch (e) {
      console.warn(e);
    }

    res.render("explorer.html", {
      explorer,
    });
  });

  app.get("/dashboard/:name", async (req, res) => {
    const base = config.get("GITHUB_BASEURL");
    const username = config.get("GITHUB_USERNAME");
    const prefix = config.get("DASH_PREFIX");
    const url = `${base}/${username}/${prefix}_${req.params.name}/master/dashboard.json`;
    const response = await fetch(url);
    const data = await response.text();
    res.render("dashboard.html", {
      title: req.params.name,
      dashData: data,
    });
  });

  app.get("/", async (req, res) => {
    const collections = await Model.getCollections();
    const recentData = await Model.search({ q: "" });
    const threeRecentData = recentData.results
      .filter((packages, index) => index < 3)
      .map((packages, index) => {
        packages.metadata_modified = moment
          .utc(packages.metadata_modified)
          .format("ll");
        return packages;
      });

    function shuffle(array) {
      return array.sort(() => Math.random() - 0.5);
    }

    // Get list of Organizations, randomize it and extract first three of them
    let orgs = await Model.getOrganizations();
    let randomOrgs = shuffle(orgs);
    let organizations = randomOrgs.slice(0, 3);

    // Applications carousel
    req.query.fq = "dataset_type:showcase";
    let apps = await Model.search(req.query);
    let randomApps = shuffle(apps.results);
    let applications = randomApps.slice(0, 9);

    applications = applications.map((applications) => {
      return {
        name: applications.name,
        title: applications.title,
        publisher: applications.sources[0].name,
        image_url: applications.image_url,
      };
    });

    const postsModel = new cmsPosts.CmsModel();
    const size = 3;
    let posts = await postsModel.getListOfPosts(size);
    posts = posts.slice(0, 3);
    posts = posts.map((posts) => {
      return {
        slug: posts.name,
        title: posts.title,
        content: posts.content.replace(/<\/?[^>]+(>|$)/g, ""),
        published: moment(posts.publish_date).format("MMMM DD, YYYY"),
        modified: moment(posts.publish_date).format("MMMM DD, YYYY"),
        image: posts.image,
      };
    });

    // Links from 'https://montreal.l3.ckan.io/pages/frontpage-calls-to-action'
    // for Home page quick search buttons
    const searchTagSlug = "frontpage-calls-to-action";
    let quickSearchPost = await postsModel.getPost(searchTagSlug);
    let content = quickSearchPost.content;
    let quickLinks = [];
    content.replace(/[^<]*(<a href="([^"]+)">([^<]+)<\/a>)/g, function () {
      quickLinks.push(Array.prototype.slice.call(arguments, 1, 4));
    });

    res.render("home.html", {
      title: "Montreal",
      collections,
      applications,
      recentData: threeRecentData,
      slug: "collections",
      posts,
      quickLinks,
      organizations: organizations,
    });
  });

  app.get("/tx", (req, res) => {
    res.send(res.__("Complete"));
  });

  app.get("/news/subscription", async (req, res) => {
    const recentData = await Model.search({ q: "" });
    const fiveRecentData = recentData.results
      .filter((packages, index) => index < 5)
      .map((packages, index) => {
        packages.metadata_modified = moment
          .utc(packages.metadata_modified)
          .format("ll");
        return packages;
      });
    res.render("subscription.html", {
      recentData: fiveRecentData,
    });
  });

  app.get("/applications", async (req, res, next) => {
    try {
      req.query.fq = "dataset_type:showcase";
      const showcases = await Model.search(req.query);

      // Pagination
      const from = req.query.from || 0;
      const size = req.query.size || 10;
      const total = showcases.count;
      const totalPages = Math.ceil(total / size);
      const currentPage = parseInt(from, 10) / size + 1;
      const pages = utils.pagination(currentPage, totalPages);

      res.render("application-showcases.html", {
        title: "Applications",
        description:
          "Showcases are any app, article or report that relate to the published dataset. For example, an annual report that contains aggregated information relating to the dataset or a website where there is further background information on the dataset or a link to an app that has been created utilising some or all of the dataset.",
        slug: "Applications",
        showcases,
        descriptions: showcases.notes,
        query: req.query,
        totalPages,
        pages,
        currentPage,
      });
    } catch (e) {
      next(e);
    }
  });

  app.get("/:owner/:name", async (req, res, next) => {
    if (
      req.params.owner !== "organization" &&
      req.params.owner !== "collections"
    ) {
      //Activities
      const ActivityModel = new ActivityFeed.ActivityModel();
      let activityLimit = 5;
      if (req.query.activity) {
        activityLimit = req.query.activity;
      }
      let activities = await ActivityModel.getPackageActivity(
        req.params.name,
        activityLimit
      );
      res.locals.activities = {
        feed: activities,
        limit: activityLimit,
      };
    }
    next();
  });

  app.get("/:owner/:name", async (req, res, next) => {
    if (req.params.owner === "collections") {
      //Activities
      const ActivityModel = new ActivityFeed.ActivityModel();
      let activityLimit = 5;
      if (req.query.activity) {
        activityLimit = req.query.activity;
      }
      let activities = await ActivityModel.getCollectionActivity(
        req.params.name,
        activityLimit
      );
      res.locals.activities = {
        feed: activities,
        limit: activityLimit,
      };
    }
    next();
  });

  app.get("/applications/single/:showcaseId", async (req, res, next) => {
    try {
      const id = req.params.showcaseId;
      const apiUrl = configApiUrl + "ckanext_showcase_show";

      // retrieving showcase
      let showcaseResponse = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          id: id,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (showcaseResponse.status !== 200) {
        throw showcaseResponse;
      }

      let showcase = await showcaseResponse.json();

      // retrieving datasets
      let datasetsResponse = await fetch(
        configApiUrl + "ckanext_showcase_package_list",
        {
          method: "POST",
          body: JSON.stringify({
            showcase_id: id,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (datasetsResponse.status !== 200) {
        throw datasetsResponse;
      }

      let datasets = await datasetsResponse.json();
      res.render("application-showcase.html", {
        title: "Applications",
        showcase: showcase.result,
        datasets: datasets.result,
      });
    } catch (e) {
      next(e);
    }
  });

  //This handles Contuct Us, Our Approach an License pages. This renders info.html page
  app.get("/:page", async (req, res, next) => {
    // key: value pairs. Key is slug, value is post.name from CKAN backend CKANEXT PAGES extension
    var infoPages = {
      "our-approach-en": "our-approach",
      "notre-demarche": "notre-demarche",
      "license-en": "license",
      "licence-d-utilisation": "licence-d-utilisation",
      "contact-us-en": "contact-us",
      "nous-joindre": "nous-joindre",
    };

    const page = req.params.page;

    if (page in infoPages) {
      try {
        const postsModel = new cmsPosts.CmsModel();
        let displayContactFormBool = "false";

        // fetch required page
        let post = await postsModel.getPost(infoPages[page]);

        // ebable contact form on following pages
        if (post.name == "contact-us" || post.name == "nous-joindre") {
          displayContactFormBool = "true";
        }

        if (post.name) {
          res.render("info.html", {
            slug: post.name,
            title: post.title,
            content: post.content,
            published: moment(post.date).format("Do MMMM YYYY"),
            modified: moment(post.modified).format("Do MMMM YYYY"),
            image: post.featured_image,
            thisPageFullUrl:
              req.protocol + "://" + req.get("host") + req.originalUrl,
            categories: post.categories ? Object.keys(post.categories) : [],
            displayContactForm: displayContactFormBool,
          });
        }
      } catch (e) {
        next(e);
      }
    } else {
      next();
    }
  });
};
