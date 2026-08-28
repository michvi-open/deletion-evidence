/**
 * mini-schema.js
 *
 * A small, dependency-free validator supporting exactly the JSON Schema
 * (2020-12) keyword subset used by der.schema.json / ver.schema.json /
 * vocab.schema.json in this project. It is not a general-purpose JSON
 * Schema engine — it exists so the reference implementation has zero
 * runtime dependencies and stays directly driven by the schema files
 * (no hand-duplicated validation rules that could drift from them).
 *
 * Supported keywords: type, const, enum, required, properties,
 * additionalProperties (boolean), items, minItems, uniqueItems,
 * maxLength, minLength, pattern, format ("date-time"), $ref (to a
 * $defs entry in one of the provided root schemas, matched by $id).
 */

'use strict';

const DATE_TIME_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value; // 'object' | 'string' | 'number' | 'boolean' | 'undefined'
}

function resolveRef(ref, rootSchemas) {
  const [base, fragment] = ref.split('#');
  const root = rootSchemas.find((s) => s.$id === base);
  if (!root) {
    throw new Error(`mini-schema: cannot resolve $ref base "${base}"`);
  }
  if (!fragment || fragment === '/') return root;
  const parts = fragment.split('/').filter(Boolean);
  let node = root;
  for (const part of parts) {
    node = node[part];
    if (node === undefined) {
      throw new Error(`mini-schema: cannot resolve $ref fragment "${fragment}" in ${base}`);
    }
  }
  return node;
}

function validateNode(schema, data, path, rootSchemas, errors) {
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, rootSchemas);
    validateNode(resolved, data, path, rootSchemas, errors);
    return;
  }

  if (schema.const !== undefined) {
    if (data !== schema.const) {
      errors.push({ path, message: `must equal constant "${schema.const}"` });
      return;
    }
  }

  if (schema.enum !== undefined) {
    if (!schema.enum.includes(data)) {
      errors.push({ path, message: `must be one of [${schema.enum.join(', ')}]` });
      return;
    }
  }

  if (schema.type !== undefined) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = typeOf(data);
    const numberOk = actual === 'number' && allowed.includes('number');
    if (!allowed.includes(actual) && !numberOk) {
      errors.push({ path, message: `must be type ${allowed.join('|')}, got ${actual}` });
      return;
    }
  }

  if (typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push({ path, message: `string shorter than minLength ${schema.minLength}` });
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push({ path, message: `string longer than maxLength ${schema.maxLength}` });
    }
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(data)) {
      errors.push({ path, message: `does not match pattern ${schema.pattern}` });
    }
    if (schema.format === 'date-time' && !DATE_TIME_RE.test(data)) {
      errors.push({ path, message: 'not a valid RFC 3339 date-time' });
    }
  }

  if (data !== null && typeOf(data) === 'object' && schema.properties) {
    const required = schema.required || [];
    for (const key of required) {
      if (!(key in data)) {
        errors.push({ path: `${path}.${key}`, message: 'missing required field' });
      }
    }
    if (schema.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(schema.properties));
      for (const key of Object.keys(data)) {
        if (!allowedKeys.has(key)) {
          errors.push({ path: `${path}.${key}`, message: 'unknown field not permitted by schema' });
        }
      }
    }
    for (const key of Object.keys(schema.properties)) {
      if (key in data) {
        validateNode(schema.properties[key], data[key], `${path}.${key}`, rootSchemas, errors);
      }
    }
  }

  if (typeOf(data) === 'array' && schema.items) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push({ path, message: `array shorter than minItems ${schema.minItems}` });
    }
    if (schema.uniqueItems) {
      const seen = new Set(data.map((v) => JSON.stringify(v)));
      if (seen.size !== data.length) {
        errors.push({ path, message: 'array items must be unique' });
      }
    }
    data.forEach((item, i) => {
      validateNode(schema.items, item, `${path}[${i}]`, rootSchemas, errors);
    });
  }
}

/**
 * @param {object} schema - the root schema to validate against (e.g. DER_SCHEMA)
 * @param {object} data - the candidate record
 * @param {object[]} rootSchemas - all schemas that may be targets of $ref (must include `schema` itself)
 * @returns {{ valid: boolean, errors: {path: string, message: string}[] }}
 */
function validate(schema, data, rootSchemas) {
  const errors = [];
  validateNode(schema, data, '$', rootSchemas, errors);
  return { valid: errors.length === 0, errors };
}

module.exports = { validate, resolveRef };
