import * as bufferModule from 'buffer';

if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}

process.env.EMAIL_API_KEY ||= 're_TEST_API_KEY';
