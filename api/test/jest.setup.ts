import { createRequire } from 'module';

const nodeRequire = createRequire(__filename);
const buffer = nodeRequire('buffer');

if (typeof buffer.SlowBuffer === 'undefined') {
  buffer.SlowBuffer = buffer.Buffer;
}
