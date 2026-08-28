'use strict';

const { canonicalize } = require('./canonicalize');
const { computeRecordHash, sealRecord, verifyLink } = require('./hash');
const { validateDER, validateVER, setSchemas } = require('./validate');
const { renderRecord } = require('./render');

module.exports = {
  canonicalize,
  computeRecordHash,
  sealRecord,
  verifyLink,
  validateDER,
  validateVER,
  setSchemas,
  renderRecord,
};
