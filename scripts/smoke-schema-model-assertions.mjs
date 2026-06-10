import { createModelProjectFixture } from './smoke-fixtures.mjs';

export function assertSchemaModelBehavior(schema, assert) {
  const sharedPart = schema.createModelPart('p', 'Part', 'box', '#ffffff', '#111111', [0, 1, 0], [0, 0, 0], [1, 1, 1]);
  assert(sharedPart.wire === true && sharedPart.opacity === 1, 'shared part factory should set editor defaults');
  const normalizedPart = schema.normalizeModelPart({ shape: 'missing', color: 'bad', scale: [0, 9, 1] });
  assert(normalizedPart.shape === 'box', 'shared part normalizer should clamp invalid shapes');
  assert(normalizedPart.color === '#d8d0c0', 'shared part normalizer should repair invalid colors');
  assert(normalizedPart.scale[0] === 0.03 && normalizedPart.scale[1] === 4, 'shared part normalizer should clamp scales');
  const defaultModelProject = schema.createDefaultModelProject(['enemy-smoke'], () => createModelProjectFixture(schema).models[0]);
  assert(defaultModelProject.modelSchema === schema.MODEL_RUNTIME_SCHEMA, 'default model project should carry runtime schema marker');
  let generatedId = 0;
  const normalizedModelProject = schema.normalizeModelProject({
    version: 1,
    models: [{ name: 'Imported Empty', category: 'enemy', role: 'custom', parts: [] }]
  }, {
    modelSchema: schema.MODEL_RUNTIME_SCHEMA,
    createId: (prefix) => `${prefix}-generated-${generatedId++}`,
    createPartId: (prefix) => `${prefix}-generated-${generatedId++}`,
    createFallbackPart: () => schema.createModelPart('core', 'Core', 'box', '#d8d0c0', '#111111', [0, 0.5, 0], [0, 0, 0], [0.5, 0.5, 0.5])
  });
  assert(normalizedModelProject.modelSchema === schema.MODEL_RUNTIME_SCHEMA, 'shared model project normalizer should opt into schema repair for editor imports');
  assert(normalizedModelProject.models[0].id === 'model-generated-0', 'shared model project normalizer should accept injected ids');
  assert(normalizedModelProject.models[0].parts[0].id === 'core', 'shared model project normalizer should keep fallback core part');
}
