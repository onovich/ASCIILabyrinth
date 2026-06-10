import { assertSchemaCoreBehavior } from './smoke-schema-core-assertions.mjs';
import { assertSchemaEditorBehavior } from './smoke-schema-editor-assertions.mjs';
import { assertSchemaModelBehavior } from './smoke-schema-model-assertions.mjs';
import { assertSchemaPersistenceBehavior } from './smoke-schema-persistence-assertions.mjs';

export { assertRuntimeConversions } from './smoke-runtime-conversion-assertions.mjs';

export function assertSharedSchemaBehavior(schema, assert, assertNamedContract) {
  assertSchemaCoreBehavior(schema, assert, assertNamedContract);
  assertSchemaPersistenceBehavior(schema, assert);
  assertSchemaEditorBehavior(schema, assert);
  assertSchemaModelBehavior(schema, assert);
}
