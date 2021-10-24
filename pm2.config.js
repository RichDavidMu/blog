module.exports = {
  apps : [{
    name   : "github_webhook",
    script : "./github_webhook.js",
    log_date_format: "YYYY-MM-DD HH:mm Z",
    combine_logs: true,
    merge_logs: true,
  }]
}
