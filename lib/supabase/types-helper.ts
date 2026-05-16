/**
 * Type-safe helper for Supabase mutations when using hand-written types.
 *
 * Until `npm run db:types` is run against a live project, mutation payloads
 * need an explicit cast. This helper makes the intent visible and searchable.
 *
 * Usage:
 *   supabase.from("table").insert(asInsert({ ... }))
 *   supabase.from("table").update(asUpdate({ ... }))
 */
export function asInsert<T>(value: T): never {
  return value as never;
}

export function asUpdate<T>(value: T): never {
  return value as never;
}

/** Cast a select result to a known Row type when generics don't resolve. */
export function asRow<T>(value: unknown): T {
  return value as T;
}
