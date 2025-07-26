module.exports = {
  siteUrl: process.env.SITE_URL || 'https://mhsenam.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*'],
}; 