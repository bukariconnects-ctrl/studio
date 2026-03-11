export const PERMISSIONS = {
  BOOKINGS_VIEW_ALL: "bookings.view_all",
  BOOKINGS_MANAGE: "bookings.manage",
  PRODUCTS_MANAGE: "products.manage",
  INVENTORY_UPDATE: "inventory.update",
  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",
  ANALYTICS_VIEW: "analytics.view",
  SETTINGS_CMS: "settings.cms",
  SERVICES_MANAGE: "services.manage",
  PACKAGES_MANAGE: "packages.manage",
  TICKETS_MANAGE: "tickets.manage",
  ALBUMS_MANAGE: "albums.manage",
  AI_MANAGE: "ai.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
