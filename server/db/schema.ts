import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  smallint,
  serial,
  boolean,
  text,
  varchar,
  uuid,
  integer,
  timestamp,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`),
  githubId: varchar("github_id").notNull().unique(),
  username: varchar("username").notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  orgsMemberships: many(orgMembers),
}));

export const sessions = pgTable("sessions", {
  id: uuid("id").notNull(),
  userId: uuid("user_id").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

//
export const orgs = pgTable("orgs", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const orgRelations = relations(orgs, ({ many }) => ({
  members: many(orgMembers),
  endpoints: many(endpoints),
  destinations: many(destinations),
}));

//
export const orgMembers = pgTable("org_members", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const orgMemberRelations = relations(orgMembers, ({ one }) => ({
  user: one(users, {
    fields: [orgMembers.userId],
    references: [users.id],
  }),
  org: one(orgs, {
    fields: [orgMembers.orgId],
    references: [orgs.id],
  }),
}));

//

export const routingStrategyEnum = pgEnum("routing_strategy", ["first", "all"]);
export const endpoints = pgTable("endpoints", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").notNull(),
  response: json("response")
    .notNull()
    .$type<{ code: number; content: string }>(),
  routingStrategy: routingStrategyEnum("routing_strategy").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const endpointRelations = relations(endpoints, ({ one, many }) => ({
  org: one(orgs, {
    fields: [endpoints.orgId],
    references: [orgs.id],
  }),
  destinations: many(endpointDestinations),
}));

export const destinations = pgTable("destinations", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  headers: text("headers").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const destinationRelations = relations(
  destinations,
  ({ one, many }) => ({
    org: one(orgs, {
      fields: [destinations.orgId],
      references: [orgs.id],
    }),
    endpoints: many(endpointDestinations),
  })
);

export const endpointDestinations = pgTable("endpoint_destinations", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").notNull(),
  endpointId: uuid("endpoint_id").notNull(),
  destinationId: uuid("destination_id").notNull(),
  order: smallint("order").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
});

export const endpointDestinationRelations = relations(
  endpointDestinations,
  ({ one, many }) => ({
    org: one(orgs, {
      fields: [endpointDestinations.orgId],
      references: [orgs.id],
    }),
    endpoint: one(endpoints, {
      fields: [endpointDestinations.endpointId],
      references: [endpoints.id],
    }),
    destination: one(destinations, {
      fields: [endpointDestinations.destinationId],
      references: [destinations.id],
    }),
  })
);

//
export const messages = pgTable("messages", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").notNull(),
  endpointId: uuid("endpoint_id").notNull(),
  headers: json("headers").notNull(),
  body: json("body").notNull(),
  response: json("response")
    .notNull()
    .$type<{ code: number; content: string }>(),
  origin: text("origin").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const messageRelations = relations(messages, ({ one }) => ({
  org: one(orgs, {
    fields: [messages.orgId],
    references: [orgs.id],
  }),
  endpoint: one(endpoints, {
    fields: [messages.endpointId],
    references: [endpoints.id],
  }),
}));

export const messageDeliveries = pgTable("message_deliveries", {
  id: uuid("id")
    .notNull()
    .default(sql`gen_random_uuid()`),
  messageId: uuid("message_id").notNull(),
  destinationId: uuid("destination_id").notNull(),
  response: json("response")
    .notNull()
    .$type<{ code: number; content: string }>(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const messageDeliveryRelations = relations(
  messageDeliveries,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageDeliveries.messageId],
      references: [messages.id],
    }),
    destination: one(destinations, {
      fields: [messageDeliveries.destinationId],
      references: [destinations.id],
    }),
  })
);

export type DatabaseUser = typeof users;
