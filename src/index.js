'use strict';

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    try {
      // Role Public
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (!publicRole) {
        strapi.log.warn('[bootstrap] Public role not found.');
        return;
      }

      // Todas as permissões do role Public
      const permissions = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({
          where: { role: publicRole.id },
          limit: 10000,
        });

      // Content types criados por ti (api::...)
      const apiContentTypes = Object.values(strapi.contentTypes).filter(
        (ct) => ct && typeof ct.uid === 'string' && ct.uid.startsWith('api::') && ct.info && ct.info.singularName
      );

      for (const ct of apiContentTypes) {
        const singular = ct.info.singularName;

        // action prefix no formato: api::<singular>.<singular>.
        const controllerPrefix = 'api::' + singular + '.' + singular + '.';

        const targets = permissions.filter((p) => {
          return (
            p &&
            typeof p.action === 'string' &&
            p.action.startsWith(controllerPrefix) &&
            (p.action.endsWith('.find') || p.action.endsWith('.findOne'))
          );
        });

        for (const p of targets) {
          if (!p.enabled) {
            await strapi
              .query('plugin::users-permissions.permission')
              .update({ where: { id: p.id }, data: { enabled: true } });
          }
        }
      }

      strapi.log.info('[bootstrap] Public find/findOne ensured for all api content types.');
    } catch (err) {
      strapi.log.error('[bootstrap] Failed to ensure public permissions: ' + (err && err.message ? err.message : err));
    }
  },
};
