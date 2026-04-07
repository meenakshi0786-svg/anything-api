import type { ExecutionContext } from "../engine.js";

/**
 * Transform / reshape extracted data.
 * Supports: map, filter, pick, flatten, deduplicate, rename.
 */
export async function executeTransform(
  config: {
    source: string;          // variable name containing source data
    operations: TransformOp[];
    outputKey?: string;       // store result under this key
  },
  context: ExecutionContext
): Promise<unknown> {
  let data = context.variables[config.source];

  for (const op of config.operations) {
    data = applyOperation(data, op);
  }

  if (config.outputKey) {
    context.variables[config.outputKey] = data;
  }

  return data;
}

type TransformOp =
  | { type: "pick"; fields: string[] }
  | { type: "rename"; mapping: Record<string, string> }
  | { type: "filter"; field: string; operator: "eq" | "neq" | "gt" | "lt" | "contains"; value: unknown }
  | { type: "flatten" }
  | { type: "deduplicate"; field: string }
  | { type: "sort"; field: string; order: "asc" | "desc" }
  | { type: "limit"; count: number };

function applyOperation(data: unknown, op: TransformOp): unknown {
  if (!Array.isArray(data)) {
    if (typeof data === "object" && data !== null) {
      data = [data];
    } else {
      return data;
    }
  }

  const arr = data as Record<string, unknown>[];

  switch (op.type) {
    case "pick":
      return arr.map((item) => {
        const picked: Record<string, unknown> = {};
        for (const field of op.fields) {
          if (field in item) picked[field] = item[field];
        }
        return picked;
      });

    case "rename":
      return arr.map((item) => {
        const renamed: Record<string, unknown> = { ...item };
        for (const [from, to] of Object.entries(op.mapping)) {
          if (from in renamed) {
            renamed[to] = renamed[from];
            delete renamed[from];
          }
        }
        return renamed;
      });

    case "filter":
      return arr.filter((item) => {
        const val = item[op.field];
        switch (op.operator) {
          case "eq": return val === op.value;
          case "neq": return val !== op.value;
          case "gt": return Number(val) > Number(op.value);
          case "lt": return Number(val) < Number(op.value);
          case "contains": return String(val).includes(String(op.value));
          default: return true;
        }
      });

    case "flatten":
      return arr.flat();

    case "deduplicate":
      const seen = new Set();
      return arr.filter((item) => {
        const key = String(item[op.field]);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    case "sort":
      return [...arr].sort((a, b) => {
        const aVal = a[op.field];
        const bVal = b[op.field];
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return op.order === "desc" ? -cmp : cmp;
      });

    case "limit":
      return arr.slice(0, op.count);

    default:
      return arr;
  }
}
