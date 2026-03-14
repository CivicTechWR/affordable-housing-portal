import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';

let primaryKeyFieldsByModel: Map<string, Set<string>> | undefined;

const resolveSchemaPath = () => {
  const possiblePaths = [
    path.resolve(process.cwd(), 'prisma/schema.prisma'),
    path.resolve(process.cwd(), 'api/prisma/schema.prisma'),
    path.resolve(__dirname, '../../prisma/schema.prisma'),
  ];

  return possiblePaths.find((schemaPath) => fs.existsSync(schemaPath));
};

const parsePrimaryKeyFields = () => {
  const schemaPath = resolveSchemaPath();
  if (!schemaPath) {
    return new Map<string, Set<string>>();
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');
  const modelBlocks = schema.matchAll(/model\s+(\w+)\s+\{([\s\S]*?)^\}/gm);

  return new Map(
    Array.from(modelBlocks, ([, modelName, body]) => {
      const primaryKeyFields = new Set<string>();

      for (const rawLine of body.split('\n')) {
        const line = rawLine.trim();

        if (!line || line.startsWith('//')) {
          continue;
        }

        if (line.startsWith('@@id([')) {
          const fields = line
            .slice('@@id(['.length, line.indexOf(']'))
            .split(',')
            .map((field) => field.trim())
            .filter(Boolean);

          fields.forEach((field) => primaryKeyFields.add(field));
          continue;
        }

        if (line.startsWith('@@')) {
          continue;
        }

        if (line.includes('@id')) {
          const [fieldName] = line.split(/\s+/, 1);
          primaryKeyFields.add(fieldName);
        }
      }

      return [modelName, primaryKeyFields];
    }),
  );
};

const getPrimaryKeyFields = (modelName: string) => {
  primaryKeyFieldsByModel ||= parsePrimaryKeyFields();
  return primaryKeyFieldsByModel.get(modelName) || new Set<string>();
};

export const fillModelStringFields = (
  modelName: string,
  data: Record<string, string | null>,
) => {
  const primaryKeyFields = getPrimaryKeyFields(modelName);

  return Object.fromEntries(
    Prisma.dmmf.datamodel.models
      .filter((model) => model.name === modelName)[0]
      .fields.filter(
        (field) => !primaryKeyFields.has(field.name) && field.type === 'String',
      )
      .map((field) => [field.name, data[field.name] || null]),
  );
};
