export function getFieldMeta(schema) {
  const meta = {};
  const shape = schema.shape;
  for (const key in shape) {
    const result = shape[key].safeParse(undefined);
    meta[key] = !result.success; // true = required, false = optional
  }
  return meta;
}
