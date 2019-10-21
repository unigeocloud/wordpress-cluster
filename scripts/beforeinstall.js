var resp = {
  result: 0,
  ssl: !!jelastic.billing.account.GetQuotas('environment.jelasticssl.enabled').array[0].value,
  nodes: [{
    nodeType: "storage",
    cloudlets: 8,
    nodeGroup: "storage",
    displayName: "Storage"
  }]
}

if (${settings.galera:false}) {
  resp.nodes.push({
    nodeType: "mariadb-dockerized",
    tag: "10.3.16",
    count: 3,
    cloudlets: 8,
    nodeGroup: "sqldb",
    displayName: "Galera cluster",
    restartDelay: 5,
    env: {
      ON_ENV_INSTALL: "",
      JELASTIC_PORTS: "4567,4568,4444"
    }
  })
}

if (!${settings.galera:false}) {
  resp.nodes.push({
    nodeType: "mariadb-dockerized",
    tag: "10.3.16",
    count: 1,
    cloudlets: 16,
    nodeGroup: "sqldb",
    displayName: "DB Server"
  })
}

if (${settings.ls-addon:false}) {
  resp.nodes.push({
    nodeType: "litespeedadc",
    tag: "2.5.1",
    count: 1,
    cloudlets: 8,
    nodeGroup: "bl",
    scalingMode: "STATEFUL",
    displayName: "Load balancer"
  }, {
    nodeType: "litespeedphp",
    tag: "5.4.1-php-7.3.7",
    count: 2,
    cloudlets: 8,
    nodeGroup: "cp",
    scalingMode: "STATELESS",
    displayName: "AppServer",
    env: {
      SERVER_WEBROOT: "/var/www/webroot/ROOT",
      REDIS_ENABLED: "true",
      WAF: "${settings.waf}"
    },
    volumes: [
      "/var/www/webroot/ROOT",
      "/var/www/webroot/.cache"
    ],  
    volumeMounts: {
      "/var/www/webroot/ROOT": {
        readOnly: "false",
        sourcePath: "/data/ROOT",
        sourceNodeGroup: "storage"
      },   
      "/var/www/webroot/.cache": {
        readOnly: "false",
        sourcePath: "/data/.cache",
        sourceNodeGroup: "storage"
      }
    }
  })
}

if (!${settings.ls-addon:false}) {
  resp.nodes.push({
    nodeType: "nginx-dockerized",
    tag: "1.16.0",
    count: 1,
    cloudlets: 8,
    nodeGroup: "bl",
    scalingMode: "STATEFUL",
    displayName: "Load balancer"
  }, {
    nodeType: "nginxphp-dockerized",
    tag: "1.16.0-php-7.3.8",
    count: 1,
    cloudlets: 8,
    nodeGroup: "cp",
    scalingMode: "STATELESS",
    displayName: "AppServer",
    env: {
      SERVER_WEBROOT: "/var/www/webroot/ROOT",
      REDIS_ENABLED: "true"
    },
    volumes: [
      "/var/www/webroot/ROOT",
      "/etc/nginx/conf.d/SITES_ENABLED"
    ],  
    volumeMounts: {
      "/var/www/webroot/ROOT": {
        readOnly: "false",
        sourcePath: "/data/ROOT",
        sourceNodeGroup: "storage"
      },
      "/etc/nginx/conf.d/SITES_ENABLED": {
        readOnly: "false",
        sourcePath: "/data/APP_CONFIGS",
        sourceNodeGroup: "storage"
      }
    }
  })
}

return resp;
